import { useParams } from 'react-router-dom';

export default function UseCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1 className="text-xl font-semibold">Use case {id}</h1>
      <p className="mt-2 text-slate-600">Detail view.</p>
    </div>
  );
}
