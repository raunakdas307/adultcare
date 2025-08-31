export const containerClass = (theme) =>
  theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900";


export const cardClass = (theme) =>
  theme === 'dark'
    ? 'bg-gray-800'
    : 'bg-purple-50 hover:bg-purple-100 transition-colors';

export const softBorder = (theme) =>
  theme === 'dark' ? 'border-gray-700' : 'border-purple-100';
