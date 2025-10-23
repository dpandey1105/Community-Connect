import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useLocation, useSearchParams } from "wouter";

const indianStates = [
  "All Locations",
  "Delhi", "Maharashtra", "West Bengal", "Karnataka", "Tamil Nadu",
  "Uttar Pradesh", "Gujarat", "Rajasthan", "Punjab", "Haryana",
  "Kerala", "Madhya Pradesh", "Bihar", "Odisha", "Telangana",
  "Andhra Pradesh", "Jharkhand", "Assam", "Chhattisgarh", "Uttarakhand"
];

const categories = [
  "All Categories",
  "Education", "Healthcare", "Environment", "Women Empowerment",
  "Child Welfare", "Elder Care", "Food Security", "Water & Sanitation"
];

export default function SearchFilters() {
  const [location, navigate] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const currentPath = (location.split('?')[0]) || '/';

  const selectedLocation = searchParams.get('state') || 'All Locations';
  const selectedCategory = searchParams.get('category') || 'All Categories';

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        newParams.set('search', searchTerm);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams, { replace: true });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, currentPath, setSearchParams, searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedLocation && selectedLocation !== 'All Locations') {
      params.append('state', selectedLocation);
    }
    if (selectedCategory && selectedCategory !== 'All Categories') {
      params.append('category', selectedCategory);
    }

    navigate(`${currentPath}?${params.toString()}`);
  };

  const handleInputChange = (key, value) => {
    if (key === 'search') {
      setSearchTerm(value);
    } else {
      const newParams = new URLSearchParams(searchParams.toString());
      if (value && value !== 'All Locations' && value !== 'All Categories') {
        newParams.set(key === 'location' ? 'state' : key, value);
      } else {
        newParams.delete(key === 'location' ? 'state' : key);
      }
      setSearchParams(newParams, { replace: true });
    }
  };

  return (
    <section className="py-16 bg-muted" data-testid="search-filters-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-serif">Find Your Perfect Volunteer Opportunity</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Search through hundreds of meaningful projects across India and make a lasting impact in communities that need you most.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">Search Projects</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="search"
                  type="text"
                  placeholder="Teaching, healthcare, environment..."
                  value={searchTerm}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">Location</Label>
              <Select value={selectedLocation} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger data-testid="location-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">Category</Label>
              <Select value={selectedCategory} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger data-testid="category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={handleSearch} className="btn-primary text-primary-foreground" data-testid="search-button">
              <Search className="mr-2" size={16} />
              Search Projects
            </Button>
            <Button
              variant="outline"
              data-testid="reset-filters-button"
              onClick={() => {
                setSearchTerm('');
                setSearchParams(new URLSearchParams(), { replace: true });
              }}
            >
              <Filter className="mr-2" size={16} />
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
