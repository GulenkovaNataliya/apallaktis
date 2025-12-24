"use client";

import { useState } from 'react';
import type { PropertyObject } from '@/types/object';
import { getObjectColor } from '@/lib/objectColors';
import { formatEuro } from '@/lib/formatters';

interface ObjectCarouselProps {
  objects: PropertyObject[];
  onObjectClick: (object: PropertyObject) => void;
  onEdit: (object: PropertyObject) => void;
  onDelete: (id: string) => void;
  editLabel: string;
  deleteLabel: string;
  clientLabel: string;
  addressLabel: string;
  priceLabel: string;
}

export default function ObjectCarousel({
  objects,
  onObjectClick,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  clientLabel,
  addressLabel,
  priceLabel,
}: ObjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (objects.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? objects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === objects.length - 1 ? 0 : prev + 1));
  };

  const getPreviousIndex = () => (currentIndex === 0 ? objects.length - 1 : currentIndex - 1);
  const getNextIndex = () => (currentIndex === objects.length - 1 ? 0 : currentIndex + 1);

  const currentObject = objects[currentIndex];
  const previousObject = objects[getPreviousIndex()];
  const nextObject = objects[getNextIndex()];

  return (
    <div className="relative w-full" style={{ height: '400px' }}>
      {/* Карусель */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Левая карта (предыдущая) */}
        {objects.length > 1 && (
          <div
            className="absolute left-0 cursor-pointer transition-all duration-300"
            style={{
              width: '80px',
              height: '280px',
              opacity: 0.6,
              transform: 'translateX(10px)',
              zIndex: 1,
            }}
            onClick={handlePrevious}
          >
            <ObjectCard
              object={previousObject}
              color={getObjectColor(getPreviousIndex(), objects.length)}
              compact
              clientLabel={clientLabel}
              addressLabel={addressLabel}
              priceLabel={priceLabel}
            />
          </div>
        )}

        {/* Стрелка влево */}
        {objects.length > 1 && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 z-20 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--polar)',
              color: 'var(--deep-teal)',
              boxShadow: '0 4px 8px var(--deep-teal)',
            }}
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Центральная карта (текущая) */}
        <div
          className="absolute transition-all duration-300"
          style={{
            width: '280px',
            height: '360px',
            zIndex: 10,
          }}
          onClick={() => onObjectClick(currentObject)}
        >
          <ObjectCard
            object={currentObject}
            color={getObjectColor(currentIndex, objects.length)}
            onEdit={() => onEdit(currentObject)}
            onDelete={() => onDelete(currentObject.id)}
            editLabel={editLabel}
            deleteLabel={deleteLabel}
            clientLabel={clientLabel}
            addressLabel={addressLabel}
            priceLabel={priceLabel}
          />
        </div>

        {/* Стрелка вправо */}
        {objects.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 z-20 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--polar)',
              color: 'var(--deep-teal)',
              boxShadow: '0 4px 8px var(--deep-teal)',
            }}
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Правая карта (следующая) */}
        {objects.length > 1 && (
          <div
            className="absolute right-0 cursor-pointer transition-all duration-300"
            style={{
              width: '80px',
              height: '280px',
              opacity: 0.6,
              transform: 'translateX(-10px)',
              zIndex: 1,
            }}
            onClick={handleNext}
          >
            <ObjectCard
              object={nextObject}
              color={getObjectColor(getNextIndex(), objects.length)}
              compact
              clientLabel={clientLabel}
              addressLabel={addressLabel}
              priceLabel={priceLabel}
            />
          </div>
        )}
      </div>

      {/* Индикаторы */}
      {objects.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
          {objects.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: index === currentIndex ? 'var(--deep-teal)' : 'var(--polar)',
                opacity: index === currentIndex ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Карточка объекта
function ObjectCard({
  object,
  color,
  compact = false,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  clientLabel,
  addressLabel,
  priceLabel,
}: {
  object: PropertyObject;
  color: string;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  clientLabel: string;
  addressLabel: string;
  priceLabel: string;
}) {
  if (compact) {
    return (
      <div
        className="w-full h-full rounded-2xl p-3 flex flex-col justify-center"
        style={{ backgroundColor: color }}
      >
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--deep-teal)' }}>
          {object.name}
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-2xl p-6 flex flex-col"
      style={{ backgroundColor: color }}
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center" style={{ color: 'var(--deep-teal)' }}>
            {object.name}
          </h3>

          <div className="space-y-3">
            {/* Client Name - show only if filled */}
            {object.clientName && (
              <div className="text-center">
                <p className="text-xs opacity-70" style={{ color: 'var(--deep-teal)' }}>
                  {clientLabel}
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--deep-teal)' }}>
                  {object.clientName}
                </p>
              </div>
            )}

            {/* Address - show only if filled */}
            {object.address && (
              <div className="text-center">
                <p className="text-xs opacity-70" style={{ color: 'var(--deep-teal)' }}>
                  {addressLabel}
                </p>
                <p className="text-sm" style={{ color: 'var(--deep-teal)' }}>
                  {object.address}
                </p>
              </div>
            )}

            {/* Contract Price - show only if > 0 */}
            {object.contractPrice > 0 && (
              <div className="text-center">
                <p className="text-xs opacity-70" style={{ color: 'var(--deep-teal)' }}>
                  {priceLabel}
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--deep-teal)' }}>
                  {formatEuro(object.contractPrice)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {onEdit && onDelete && editLabel && deleteLabel && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
          >
            {editLabel}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--orange)', color: 'white' }}
          >
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  );
}
