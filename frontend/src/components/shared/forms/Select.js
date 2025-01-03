// src/components/shared/forms/Select.js
const Select = ({
    label,
    name,
    value,
    onChange,
    options = [], // Adăugăm valoare default
    error,
    required = false,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`mb-4 ${className}`}>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`
                    mt-1
                    block
                    w-full
                    rounded-md
                    shadow-sm
                    ${error 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                `}
            >
                <option value="">Selectează...</option>
                {Array.isArray(options) && options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default Select;