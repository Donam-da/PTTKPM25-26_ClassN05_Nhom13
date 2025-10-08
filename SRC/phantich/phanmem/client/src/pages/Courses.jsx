import { useEffect, useState } from 'react';
import { CourseService } from '../services/courses';

export function Courses() {
	const [items, setItems] = useState([]);
	useEffect(() => {
		CourseService.list().then(setItems);
	}, []);
	return (
		<div className="grid gap-3">
			{items.map((c) => (
				<div key={c._id} className="p-3 border rounded">
					<div className="font-semibold">{c.code} - {c.title}</div>
					<div className="text-sm">Số tín chỉ: {c.credits}</div>
				</div>
			))}
		</div>
	);
}
