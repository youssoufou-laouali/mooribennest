export class CreateFileDto {
  description: string;
  title: string;
  isPublic: boolean;
  files: { name: string; url: string }[];
  users: { id: string; email: string; name: string }[];
}
