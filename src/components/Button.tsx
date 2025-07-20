type ButtonProps = {
    text: string;
    color?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
  };
  
  const colorClasses = {
    primary: 'bg-[#F5B700] text-[#1E2A38] hover:bg-yellow-400',
    secondary: 'bg-[#2AB7CA] text-white hover:bg-cyan-600',
    danger: 'bg-[#EF476F] text-white hover:bg-red-600',
  };
  
  function Button({ text, color = 'primary', onClick }: ButtonProps) {
    return (
      <button
        onClick={onClick}
        className={`inline-block px-5 py-2 m-2 rounded text-lg font-medium transition-colors duration-200 cursor-pointer ${colorClasses[color]}`}
      >
        {text}
      </button>
    );
  }
  
  export default Button;
  