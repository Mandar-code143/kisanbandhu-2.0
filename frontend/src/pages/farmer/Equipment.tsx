import { demoEquipment } from '@/lib/demo-data';
import { PageHeader, StatusBadge } from '@/components/shared/SharedComponents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Star, MapPin, Tractor, Plus, IndianRupee, Upload } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Language, t } from '@/lib/i18n';

const equipmentFormText: Record<Language, Record<string, string>> = {
  en: {
    title: 'List Equipment',
    desc: 'Add your tractor, tool, or machine to the marketplace.',
    type: 'Equipment Type',
    name: 'Equipment Name',
    brand: 'Brand',
    location: 'Village / Town',
    district: 'District',
    priceDay: 'Price Per Day',
    priceHour: 'Price Per Hour',
    year: 'Year',
    condition: 'Condition',
    operator: 'Operator included',
    description: 'Description',
    image: 'Upload photo',
    submit: 'Publish Listing',
    cancel: 'Cancel',
    listed: 'Equipment Listed',
    listedDesc: 'Your equipment is now visible in the marketplace.',
    required: 'Please fill equipment name, location, and daily price.',
    requiredTitle: 'Missing details',
  },
  hi: {
    title: 'उपकरण सूचीबद्ध करें',
    desc: 'अपना ट्रैक्टर, औजार या मशीन marketplace में जोड़ें.',
    type: 'उपकरण प्रकार',
    name: 'उपकरण का नाम',
    brand: 'ब्रांड',
    location: 'गाँव / शहर',
    district: 'जिला',
    priceDay: 'प्रति दिन कीमत',
    priceHour: 'प्रति घंटा कीमत',
    year: 'वर्ष',
    condition: 'स्थिति',
    operator: 'ऑपरेटर शामिल',
    description: 'विवरण',
    image: 'फोटो अपलोड करें',
    submit: 'लिस्टिंग प्रकाशित करें',
    cancel: 'रद्द करें',
    listed: 'उपकरण सूचीबद्ध हुआ',
    listedDesc: 'आपका उपकरण अब marketplace में दिखाई देगा.',
    required: 'कृपया उपकरण नाम, स्थान और दैनिक कीमत भरें.',
    requiredTitle: 'जानकारी अधूरी है',
  },
  mr: {
    title: 'उपकरण सूचीबद्ध करा',
    desc: 'तुमचा ट्रॅक्टर, साधन किंवा मशीन marketplace मध्ये जोडा.',
    type: 'उपकरण प्रकार',
    name: 'उपकरणाचे नाव',
    brand: 'ब्रँड',
    location: 'गाव / शहर',
    district: 'जिल्हा',
    priceDay: 'प्रति दिवस किंमत',
    priceHour: 'प्रति तास किंमत',
    year: 'वर्ष',
    condition: 'स्थिती',
    operator: 'ऑपरेटर समाविष्ट',
    description: 'वर्णन',
    image: 'फोटो अपलोड करा',
    submit: 'लिस्टिंग प्रकाशित करा',
    cancel: 'रद्द करा',
    listed: 'उपकरण सूचीबद्ध झाले',
    listedDesc: 'तुमचे उपकरण आता marketplace मध्ये दिसेल.',
    required: 'कृपया उपकरणाचे नाव, स्थान आणि दैनिक किंमत भरा.',
    requiredTitle: 'माहिती अपूर्ण आहे',
  },
};

const equipmentTypes = ['Tractor', 'Rotavator', 'Harvester', 'Sprayer', 'Seed Drill', 'Cultivator', 'Trailer'];
const conditions = ['excellent', 'good', 'fair'];

export default function EquipmentMarketplace() {
  const { language } = useAuth();
  const [search, setSearch] = useState('');
  const [booked, setBooked] = useState<string[]>([]);
  const [equipment, setEquipment] = useState(demoEquipment);
  const [isListOpen, setIsListOpen] = useState(false);
  const [listingForm, setListingForm] = useState({
    type: 'Tractor',
    name: '',
    brand: '',
    location: '',
    district: 'Pune',
    pricePerDay: '',
    pricePerHour: '',
    year: String(new Date().getFullYear()),
    condition: 'good',
    operatorIncluded: false,
    description: '',
  });
  const { toast } = useToast();
  const formText = equipmentFormText[language];

  const filtered = equipment.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = [t('equip.all', language), 'Tractor', 'Rotavator', 'Harvester', 'Sprayer', 'Seed Drill'];
  const [activeCat, setActiveCat] = useState(t('equip.all', language));
  const catFiltered = activeCat === t('equip.all', language) ? filtered : filtered.filter(e => e.type === activeCat);

  const handleBook = (id: string, name: string) => {
    setBooked(prev => [...prev, id]);
    toast({ title: t('equip.bookingSent', language), description: t('equip.bookingDesc', language) });
  };

  const updateListing = (key: keyof typeof listingForm, value: string | boolean) => {
    setListingForm(prev => ({ ...prev, [key]: value }));
  };

  const submitListing = () => {
    if (!listingForm.name || !listingForm.location || !listingForm.pricePerDay) {
      toast({ title: formText.requiredTitle, description: formText.required, variant: 'destructive' });
      return;
    }

    const listedEquipment = {
      id: `local-${Date.now()}`,
      type: listingForm.type,
      name: listingForm.name,
      brand: listingForm.brand || listingForm.type,
      ownerName: 'You',
      ownerId: 'local-farmer',
      location: listingForm.location,
      district: listingForm.district,
      pricePerDay: Number(listingForm.pricePerDay),
      pricePerHour: listingForm.pricePerHour ? Number(listingForm.pricePerHour) : undefined,
      rating: 0,
      reviewCount: 0,
      available: true,
      operatorIncluded: listingForm.operatorIncluded,
      condition: listingForm.condition as 'excellent' | 'good' | 'fair',
      year: Number(listingForm.year),
      fuelType: 'Diesel',
    };

    setEquipment(prev => [listedEquipment, ...prev]);
    setActiveCat(t('equip.all', language));
    setIsListOpen(false);
    toast({ title: formText.listed, description: formText.listedDesc });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('equip.title', language)} description={`${catFiltered.length} ${t('equip.available', language)}`}>
        <Button onClick={() => setIsListOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
          <Plus className="h-4 w-4" /> {t('equip.listEquipment', language)}
        </Button>
      </PageHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder={t('equip.search', language)} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <Button key={cat} size="sm" variant={activeCat === cat ? 'default' : 'outline'} onClick={() => setActiveCat(cat)} className={`shrink-0 text-xs ${activeCat === cat ? 'bg-primary text-primary-foreground' : ''}`}>
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catFiltered.map(eq => (
          <div key={eq.id} className="rounded-xl border border-border bg-card shadow-card hover:shadow-elevated overflow-hidden">
            <div className="flex h-36 items-center justify-center bg-muted/50">
              <Tractor className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">{eq.type}</span>
                  <h3 className="text-sm font-bold text-foreground">{eq.name}</h3>
                </div>
                <StatusBadge status={eq.available ? 'active' : 'pending'} />
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {eq.location}, {eq.district}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                <div>
                  <p className="text-lg font-bold text-foreground">₹{eq.pricePerDay.toLocaleString()}</p>
                  <p className="text-muted-foreground">{t('equip.perDay', language)}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center gap-1 font-medium text-foreground"><Star className="h-3 w-3 fill-accent text-accent" /> {eq.rating}</p>
                  <p className="text-muted-foreground">{eq.reviewCount} {t('profile.reviews', language)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {eq.operatorIncluded && <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">👨‍🔧 {t('equip.operator', language)}</span>}
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{eq.condition}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{eq.year}</span>
              </div>
              {booked.includes(eq.id) ? (
                <div className="mt-3 rounded-lg bg-success/10 p-2 text-center text-xs font-semibold text-success">
                  ✓ {t('equip.booked', language)}
                </div>
              ) : (
                <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs" size="sm" disabled={!eq.available} onClick={() => handleBook(eq.id, eq.name)}>
                  {eq.available ? t('equip.book', language) : t('common.noResults', language)}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isListOpen} onOpenChange={setIsListOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formText.title}</DialogTitle>
            <DialogDescription>{formText.desc}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{formText.type}</Label>
                <Select value={listingForm.type} onValueChange={value => updateListing('type', value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{formText.name}</Label>
                <Input className="mt-1.5" value={listingForm.name} onChange={e => updateListing('name', e.target.value)} placeholder="Mahindra 575 DI" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{formText.brand}</Label>
                <Input className="mt-1.5" value={listingForm.brand} onChange={e => updateListing('brand', e.target.value)} placeholder="Mahindra" />
              </div>
              <div>
                <Label>{formText.condition}</Label>
                <Select value={listingForm.condition} onValueChange={value => updateListing('condition', value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{formText.location}</Label>
                <Input className="mt-1.5" value={listingForm.location} onChange={e => updateListing('location', e.target.value)} placeholder="Baramati" />
              </div>
              <div>
                <Label>{formText.district}</Label>
                <Input className="mt-1.5" value={listingForm.district} onChange={e => updateListing('district', e.target.value)} placeholder="Pune" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>{formText.priceDay}</Label>
                <div className="relative mt-1.5">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" type="number" value={listingForm.pricePerDay} onChange={e => updateListing('pricePerDay', e.target.value)} placeholder="2500" />
                </div>
              </div>
              <div>
                <Label>{formText.priceHour}</Label>
                <div className="relative mt-1.5">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" type="number" value={listingForm.pricePerHour} onChange={e => updateListing('pricePerHour', e.target.value)} placeholder="400" />
                </div>
              </div>
              <div>
                <Label>{formText.year}</Label>
                <Input className="mt-1.5" type="number" value={listingForm.year} onChange={e => updateListing('year', e.target.value)} placeholder="2024" />
              </div>
            </div>

            <div>
              <Label>{formText.description}</Label>
              <Textarea className="mt-1.5 min-h-24" value={listingForm.description} onChange={e => updateListing('description', e.target.value)} placeholder="Service history, attachments, fuel type, and usage notes..." />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={listingForm.operatorIncluded}
                  onChange={e => updateListing('operatorIncluded', e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                {formText.operator}
              </label>
              <Button variant="outline" type="button" className="gap-2">
                <Upload className="h-4 w-4" /> {formText.image}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsListOpen(false)}>{formText.cancel}</Button>
            <Button onClick={submitListing} className="bg-primary text-primary-foreground hover:bg-primary/90">{formText.submit}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
