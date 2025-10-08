import { useEffect, useState } from 'react';
import { RegistrationService } from '../services/registrations';

export function Registrations() {
	const [items, setItems] = useState([]);
	useEffect(() => {
		RegistrationService.list().then(setItems);
	}, []);
	return (
		<ul className="space-y-2">
			{items.map((r) => (
				<li key={r._id} className="border p-2 rounded">
					{r.course?.title} - {r.status}
				</li>
			))}
		</ul>
	);
}
