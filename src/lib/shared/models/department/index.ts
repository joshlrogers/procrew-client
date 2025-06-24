import { z } from 'zod';

const departmentSchema = z.object({
	id: z.string().uuid().optional().nullish(),
	name: z.string().min(3, 'Name is required.').max(75, 'Name is too long.'),
	shortCode: z.string().min(3, 'Short code is required.').max(8, 'Short code is too long.')
});

type Department = z.infer<typeof departmentSchema>;

export { departmentSchema as DepartmentSchema, type Department };
