'use client'

interface Category {
  id: string
  label: string
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '', label: 'Όλα' },
  { id: 'Ελαιόλαδο', label: 'Ελαιόλαδο' },
  { id: 'Μέλι', label: 'Μέλι' },
  { id: 'Κρασί', label: 'Κρασί' },
  { id: 'Βότανα', label: 'Βότανα' },
  { id: 'Τυροκομικά', label: 'Τυροκομικά' },
]

interface CategoryPillsProps {
  categories?: Category[]
  selected: string
  onChange: (categoryId: string) => void
}

export default function CategoryPills({
  categories = DEFAULT_CATEGORIES,
  selected,
  onChange,
}: CategoryPillsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Κατηγορίες προϊόντων"
    >
      {categories.map((cat) => {
        const isActive = selected === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className={`flex-shrink-0 min-h-[44px] px-4 py-2 rounded-full text-sm font-medium
                       whitespace-nowrap transition-colors touch-manipulation
                       ${isActive
                         ? 'bg-dixis-green text-white shadow-sm'
                         : 'bg-white text-gray-700 border border-gray-200 hover:border-dixis-green hover:text-dixis-green'
                       }`}
            data-testid={`category-pill-${cat.id || 'all'}`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
