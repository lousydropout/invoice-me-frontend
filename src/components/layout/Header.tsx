import { Link, useNavigate } from 'react-router-dom';
import { clearAuthHeader } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthHeader();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <span className="text-lg font-semibold">InvoiceMe</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/invoices"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Invoices
            </Link>
            <Link
              to="/customers"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Customers
            </Link>
          </nav>
        </div>
        <div className="flex items-center">
          <Button onClick={handleLogout} variant="outline" size="sm">
            Log Out
          </Button>
        </div>
      </div>
    </header>
  );
}

