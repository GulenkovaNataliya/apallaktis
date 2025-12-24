"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import ObjectCarousel from '@/components/ObjectCarousel';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import type { PropertyObject, ObjectStatus } from '@/types/object';
import { formatEuro } from '@/lib/formatters';

type ViewType = 'list' | 'add-object' | 'edit-object';

export default function ObjectsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.objects || messages.el.objects;

  // Objects state
  const [objects, setObjects] = useState<PropertyObject[]>([]);
  const [mounted, setMounted] = useState(false);

  const [view, setView] = useState<ViewType>('list');
  const [filter, setFilter] = useState<'all' | ObjectStatus>('all');
  const [editingObject, setEditingObject] = useState<PropertyObject | null>(null);

  // Load objects from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('propertyObjects');
    if (stored) {
      setObjects(JSON.parse(stored));
    }
  }, []);

  const handleDeleteObject = (id: string) => {
    if (confirm(t.confirmDelete)) {
      const updated = objects.filter(obj => obj.id !== id);
      setObjects(updated);
      localStorage.setItem('propertyObjects', JSON.stringify(updated));
    }
  };

  // Filter objects based on status
  const filteredObjects = filter === 'all'
    ? objects
    : objects.filter(obj => obj.status === filter);

  // OBJECTS LIST VIEW
  if (view === 'list') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen flex flex-col" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6" style={{ marginTop: '120px' }}>
            <button
              onClick={() => router.push(`/${locale}/page-pay`)}
              style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
            >
              {t.backToDashboard}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--polar)' }}>
            {t.title}
          </h1>

          {/* Filter Toggle */}
          <div className="flex gap-2" style={{ marginTop: '50px', marginBottom: '52px' }}>
            <button
              onClick={() => setFilter('all')}
              className="flex-1 rounded-lg"
              style={{
                minHeight: '52px',
                backgroundColor: filter === 'all' ? 'var(--zanah)' : 'var(--polar)',
                color: 'var(--deep-teal)',
                fontSize: '18px',
                fontWeight: 600,
                opacity: filter === 'all' ? 1 : 0.6,
              }}
            >
              {t.filterAll || 'Όλα'}
            </button>
            <button
              onClick={() => setFilter('open')}
              className="flex-1 rounded-lg"
              style={{
                minHeight: '52px',
                backgroundColor: filter === 'open' ? 'var(--zanah)' : 'var(--polar)',
                color: 'var(--deep-teal)',
                fontSize: '18px',
                fontWeight: 600,
                opacity: filter === 'open' ? 1 : 0.6,
              }}
            >
              {t.filterOpen}
            </button>
            <button
              onClick={() => setFilter('closed')}
              className="flex-1 rounded-lg"
              style={{
                minHeight: '52px',
                backgroundColor: filter === 'closed' ? 'var(--zanah)' : 'var(--polar)',
                color: 'var(--deep-teal)',
                fontSize: '18px',
                fontWeight: 600,
                opacity: filter === 'closed' ? 1 : 0.6,
              }}
            >
              {t.filterClosed}
            </button>
          </div>

          {/* Add Object Button */}
          <button
            onClick={() => setView('add-object')}
            className="btn-universal w-full"
            style={{ minHeight: '52px', marginBottom: '52px', fontSize: '18px', fontWeight: 600 }}
          >
            {t.addNew}
          </button>

          {/* Objects Carousel */}
          <div className="flex-1" style={{ marginTop: '52px' }}>
            {filteredObjects.length === 0 ? (
              <p className="text-center text-body" style={{ color: 'var(--polar)', opacity: 0.9 }}>
                {t.noObjects}
              </p>
            ) : (
              <ObjectCarousel
                objects={filteredObjects}
                onObjectClick={(object) => {
                  // Navigate to object finance page
                  router.push(`/${locale}/objects/${object.id}/finance`);
                }}
                onEdit={(object) => {
                  setEditingObject(object);
                  setView('edit-object');
                }}
                onDelete={handleDeleteObject}
                editLabel={t.edit}
                deleteLabel={t.delete}
                clientLabel={t.client}
                addressLabel={t.address}
                priceLabel={t.contractPrice}
              />
            )}
          </div>
        </div>
      </BackgroundPage>
    );
  }

  // ADD/EDIT OBJECT FORM
  if (view === 'add-object' || view === 'edit-object') {
    return (
      <BackgroundPage specialPage="objekt">
        <div className="min-h-screen" style={{ paddingLeft: '38px', paddingRight: '38px', paddingTop: '40px', paddingBottom: '120px' }}>

          {/* Back Button */}
          <div style={{ marginTop: '120px', marginBottom: '24px' }}>
            <button
              onClick={() => {
                setView('list');
                setEditingObject(null);
              }}
              className="text-button"
              style={{ color: 'var(--polar)', fontSize: '18px' }}
            >
              {t.backToDashboard}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--polar)' }}>
            {editingObject ? t.edit : t.addNew}
          </h1>

          <ObjectForm
            object={editingObject}
            onSave={(object) => {
              let updated;
              if (editingObject) {
                updated = objects.map(obj => obj.id === editingObject.id ? object : obj);
              } else {
                updated = [...objects, object];
              }
              setObjects(updated);
              localStorage.setItem('propertyObjects', JSON.stringify(updated));
              setView('list');
              setEditingObject(null);
            }}
            onCancel={() => {
              setView('list');
              setEditingObject(null);
            }}
            locale={locale}
          />
        </div>
      </BackgroundPage>
    );
  }

  return null;
}

// Object Form Component
function ObjectForm({
  object,
  onSave,
  onCancel,
  locale,
}: {
  object: PropertyObject | null;
  onSave: (object: PropertyObject) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const t = messages[locale]?.objects || messages.el.objects;
  const [formData, setFormData] = useState({
    name: object?.name || '',
    address: object?.address || '',
    clientName: object?.clientName || '',
    clientContact: object?.clientContact || '',
    contractPrice: object?.contractPrice || 0,
    status: object?.status || 'open' as ObjectStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newObject: PropertyObject = {
      id: object?.id || Date.now().toString(),
      userId: 'current-user',
      name: formData.name,
      address: formData.address,
      clientName: formData.clientName,
      clientContact: formData.clientContact,
      contractPrice: formData.contractPrice,
      status: formData.status,
      createdAt: object?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newObject);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '96px' }}>
      {/* Name Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.name || 'Όνομα'}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.name || 'Όνομα'}
        />
      </div>

      {/* Address Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.address}
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.address}
        />
      </div>

      {/* Client Name Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.client}
        </label>
        <input
          type="text"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.client}
        />
      </div>

      {/* Client Contact Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.clientContact || 'Τηλέφωνο Πελάτη'}
        </label>
        <input
          type="text"
          value={formData.clientContact}
          onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder={t.clientContact || 'Τηλέφωνο'}
        />
      </div>

      {/* Contract Price Input */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.contractPrice}
        </label>
        <input
          type="number"
          value={formData.contractPrice || ''}
          onChange={(e) => setFormData({ ...formData, contractPrice: parseFloat(e.target.value) || 0 })}
          required
          min="0"
          step="0.01"
          className="w-full p-3 rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px' }}
          placeholder="€"
        />
      </div>

      {/* Status Select */}
      <div>
        <label className="block mb-2 text-button" style={{ color: 'var(--polar)' }}>
          {t.status}
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ObjectStatus })}
          className="w-full rounded-lg text-body"
          style={{ border: '2px solid var(--polar)', color: 'var(--polar)', backgroundColor: 'transparent', minHeight: '52px', padding: '12px', fontSize: '18px' }}
        >
          <option value="open" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.statusOpen || t.filterOpen}</option>
          <option value="closed" style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>{t.statusClosed || t.filterClosed}</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
        >
          {t.cancel || 'Ακύρωση'}
        </button>
        <button
          type="submit"
          className="btn-universal flex-1"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', fontSize: '18px', fontWeight: 600 }}
        >
          {t.save || 'Αποθήκευση'}
        </button>
      </div>
    </form>
  );
}
