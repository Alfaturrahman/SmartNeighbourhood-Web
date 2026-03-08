interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
