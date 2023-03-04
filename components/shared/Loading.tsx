import { MoonLoader } from 'react-spinners';

export const Loading = ({ label = '', color = 'white' }: { label?: string; color?: string }) => {
  return (
    <div className="flex items-center space-x-2 text-center">
      <MoonLoader size={15} color={color} />
      <span>{label}</span>
    </div>
  );
};
