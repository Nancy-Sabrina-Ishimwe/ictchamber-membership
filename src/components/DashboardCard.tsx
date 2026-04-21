type Props = {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
};

export default function DashboardCard({
  icon,
  title,
  value,
  color,
}: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className={`w-10 h-10 flex items-center justify-center rounded ${color}`}>
        {icon}
      </div>

      <p className="text-gray-500 text-sm mt-4">{title}</p>
      <h3 className="text-xl font-bold">
        {value.toLocaleString()}
      </h3>
    </div>
  );
}