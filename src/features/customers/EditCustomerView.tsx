import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { useCustomerDetail } from './useCustomerDetail';

export function EditCustomerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, loading, error: fetchError } = useCustomerDetail(id);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Populate form when customer data loads
  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setPaymentTerms(customer.paymentTerms || '');
      setStreet(customer.street || '');
      setCity(customer.city || '');
      setPostalCode(customer.postalCode || '');
      setCountry(customer.country || '');
    }
  }, [customer]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      setSubmitError('Customer ID is required');
      return;
    }

    if (!name.trim()) {
      setSubmitError('Customer name is required');
      return;
    }

    if (!email.trim()) {
      setSubmitError('Email is required');
      return;
    }

    if (!paymentTerms.trim()) {
      setSubmitError('Payment terms are required');
      return;
    }

    // All address fields are required
    if (!street.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setSubmitError('All address fields (Street, City, Postal Code, Country) are required');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Ensure all required fields have values after trimming
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedPaymentTerms = paymentTerms.trim();
      const trimmedStreet = street.trim();
      const trimmedCity = city.trim();
      const trimmedPostalCode = postalCode.trim();
      const trimmedCountry = country.trim();

      if (!trimmedName || !trimmedEmail || !trimmedPaymentTerms || !trimmedStreet || !trimmedCity || !trimmedPostalCode || !trimmedCountry) {
        setSubmitError('All required fields must be filled');
        return;
      }

      const payload: {
        name: string;
        email: string;
        phone?: string;
        paymentTerms: string;
        address: {
          street: string;
          city: string;
          postalCode: string;
          country: string;
        };
      } = {
        name: trimmedName,
        email: trimmedEmail,
        paymentTerms: trimmedPaymentTerms,
        address: {
          street: trimmedStreet,
          city: trimmedCity,
          postalCode: trimmedPostalCode,
          country: trimmedCountry,
        },
      };

      if (phone.trim()) {
        payload.phone = phone.trim();
      }

      await apiClient.put(`/api/customers/${id}`, payload);

      setSuccess(true);
      // Redirect to customer detail after 2 seconds
      setTimeout(() => {
        navigate(`/customers/${id}`);
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Failed to update customer';
      
      // Handle API validation errors
      if (err.response?.data?.details) {
        const details = err.response.data.details;
        if (typeof details === 'object') {
          // Format validation errors
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
      console.error('Update customer error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading customer...</div>
        </div>
      </div>
    );
  }

  if (fetchError || !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">
            {fetchError || 'Customer not found'}
          </div>
          <Link to="/customers" className="mt-4 block">
            <Button variant="secondary">Back to Customers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to={`/customers/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Customer
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Customer</h1>
        <p className="mt-2 text-muted-foreground">Update customer information</p>
      </div>

      {success ? (
        <div className="rounded-lg border bg-green-50 p-6 text-center dark:bg-green-900/20">
          <div className="text-lg font-semibold text-green-800 dark:text-green-200">
            Customer updated successfully!
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            Redirecting to customer details...
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Customer Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter customer name"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="customer@example.com"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="+1 (555) 123-4567"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentTerms" className="text-sm font-medium">
                Payment Terms <span className="text-destructive">*</span>
              </label>
              <select
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
                disabled={submitting}
              >
                <option value="">Select payment terms</option>
                <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                <option value="NET_15">Net 15</option>
                <option value="NET_30">Net 30</option>
                <option value="NET_45">Net 45</option>
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold">Address <span className="text-destructive">*</span></h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="street" className="text-sm font-medium">
                      Street <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="123 Main St"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        City <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="City"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="postalCode" className="text-sm font-medium">
                        Postal Code <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="ZIP / Postal Code"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium">
                      Country <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Country"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Customer'}
              </Button>
              <Link to={`/customers/${id}`}>
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

