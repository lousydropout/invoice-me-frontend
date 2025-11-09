import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/features/customers/useCustomers';
import { useCustomerDetail } from '@/features/customers/useCustomerDetail';
import { useInvoiceDetail } from './useInvoiceDetail';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function EditInvoiceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, loading: customersLoading } = useCustomers();
  const { invoice, loading: invoiceLoading, error: fetchError } = useInvoiceDetail(id);
  
  const [customerId, setCustomerId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch customer details when customer is selected
  const { customer: selectedCustomer } = useCustomerDetail(customerId || undefined);

  // Populate form when invoice data loads
  useEffect(() => {
    if (invoice) {
      setCustomerId(invoice.customerId);
      setIssueDate(invoice.issueDate.split('T')[0]);
      setDueDate(invoice.dueDate.split('T')[0]);
      setCurrency(invoice.total?.currency || invoice.subtotal?.currency || 'USD');
      
      // Convert tax rate from decimal to percentage for display
      if (invoice.taxRate !== undefined && invoice.taxRate !== null) {
        setTaxRate((invoice.taxRate * 100).toString());
      } else {
        setTaxRate('');
      }
      
      setNotes(invoice.notes || '');
      
      // Populate line items
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        setLineItems(
          invoice.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice?.amount || 0,
          }))
        );
      }
    }
  }, [invoice]);

  // Format payment terms for display
  const formatPaymentTerms = (terms?: string): string => {
    if (!terms) return '';
    const formatted = terms.replace(/_/g, ' ').toLowerCase();
    return formatted
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate due date based on issue date and payment terms
  const calculateDueDate = (issue: string, paymentTerms?: string): string => {
    if (!issue) return '';
    
    const issueDateObj = new Date(issue);
    let daysToAdd = 0;

    if (paymentTerms === 'DUE_ON_RECEIPT') {
      daysToAdd = 0;
    } else if (paymentTerms === 'NET_15') {
      daysToAdd = 15;
    } else if (paymentTerms === 'NET_30') {
      daysToAdd = 30;
    } else if (paymentTerms === 'NET_45') {
      daysToAdd = 45;
    } else {
      // Default to NET_30 if payment terms not available
      daysToAdd = 30;
    }

    const dueDateObj = new Date(issueDateObj);
    dueDateObj.setDate(dueDateObj.getDate() + daysToAdd);
    return dueDateObj.toISOString().split('T')[0];
  };

  // Update due date when customer or issue date changes (only if user hasn't manually set it)
  useEffect(() => {
    if (issueDate && selectedCustomer?.paymentTerms && !dueDate) {
      const calculatedDueDate = calculateDueDate(issueDate, selectedCustomer.paymentTerms);
      setDueDate(calculatedDueDate);
    }
  }, [issueDate, selectedCustomer?.paymentTerms]);

  const handleIssueDateChange = (date: string) => {
    setIssueDate(date);
    // Due date will be recalculated by useEffect if needed
  };

  const handleCustomerChange = (newCustomerId: string) => {
    setCustomerId(newCustomerId);
    // Due date will be recalculated by useEffect when customer details load
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      setSubmitError('Invoice ID is required');
      return;
    }

    if (!customerId) {
      setSubmitError('Please select a customer');
      return;
    }

    if (!issueDate) {
      setSubmitError('Issue date is required');
      return;
    }

    if (!dueDate) {
      setSubmitError('Due date is required');
      return;
    }

    // Validate line items
    const validLineItems = lineItems.filter(
      (item) => item.description.trim() && item.quantity > 0 && item.unitPrice >= 0
    );

    if (validLineItems.length === 0) {
      setSubmitError('At least one valid line item is required');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload: {
        customerId: string;
        issueDate: string;
        dueDate: string;
        currency: string;
        lineItems: Array<{
          description: string;
          quantity: number;
          unitPriceAmount: number;
          unitPriceCurrency: string;
        }>;
        taxRate?: number;
        notes?: string;
      } = {
        customerId,
        issueDate,
        dueDate,
        currency,
        lineItems: validLineItems.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPriceAmount: item.unitPrice,
          unitPriceCurrency: currency,
        })),
      };

      if (taxRate.trim()) {
        const rate = parseFloat(taxRate);
        if (!isNaN(rate) && rate >= 0) {
          // Convert percentage to decimal (e.g., 7.1% -> 0.071)
          payload.taxRate = rate / 100;
        }
      }

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      await apiClient.put(`/api/invoices/${id}`, payload);

      setSuccess(true);
      // Redirect to invoice detail after 2 seconds
      setTimeout(() => {
        navigate(`/invoices/${id}`);
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Failed to update invoice';
      
      // Handle API validation errors
      if (err.response?.data?.details) {
        const details = err.response.data.details;
        if (typeof details === 'object') {
          const errorMessages = Object.entries(details)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          errorMessage = errorMessages;
        } else if (typeof details === 'string') {
          errorMessage = details;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setSubmitError(errorMessage);
      console.error('Update invoice error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (invoiceLoading || customersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (fetchError || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">
            {fetchError || 'Invoice not found'}
          </div>
          <Link to="/invoices" className="mt-4 block">
            <Button variant="secondary">Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to={`/invoices/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Invoice
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Invoice</h1>
        <p className="mt-2 text-muted-foreground">Update invoice {invoice.invoiceNumber}</p>
      </div>

      {success ? (
        <div className="rounded-lg border bg-green-50 p-6 text-center dark:bg-green-900/20">
          <div className="text-lg font-semibold text-green-800 dark:text-green-200">
            Invoice updated successfully!
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            Redirecting to invoice details...
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="customerId" className="text-sm font-medium">
                  Customer <span className="text-destructive">*</span>
                </label>
                <select
                  id="customerId"
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  disabled={submitting}
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email ? `(${customer.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="currency" className="text-sm font-medium">
                  Currency <span className="text-destructive">*</span>
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  disabled={submitting}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="issueDate" className="text-sm font-medium">
                  Issue Date <span className="text-destructive">*</span>
                </label>
                <input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => handleIssueDateChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date <span className="text-destructive">*</span>
                  {selectedCustomer?.paymentTerms && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Based on {formatPaymentTerms(selectedCustomer.paymentTerms)})
                    </span>
                  )}
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  disabled={submitting}
                />
                {selectedCustomer?.paymentTerms && (
                  <p className="text-xs text-muted-foreground">
                    Calculated from issue date and customer payment terms. You can adjust if needed.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="taxRate" className="text-sm font-medium">
                  Tax Rate (%)
                </label>
                <input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="0.00"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Line Items <span className="text-destructive">*</span></h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  disabled={submitting}
                >
                  Add Item
                </Button>
              </div>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid gap-4 rounded-lg border p-4 md:grid-cols-12">
                    <div className="md:col-span-5">
                      <label className="text-xs font-medium text-muted-foreground">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Item description"
                        disabled={submitting}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={submitting}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-medium text-muted-foreground">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="0.00"
                        disabled={submitting}
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <span className="text-sm font-medium">
                        {(item.quantity * item.unitPrice).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          disabled={submitting}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Additional notes or terms"
                rows={3}
                disabled={submitting}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Invoice'}
              </Button>
              <Link to={`/invoices/${id}`}>
                <Button type="button" variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

