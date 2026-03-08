# Contributing to Smart Neighborhood

Terima kasih atas minat Anda untuk berkontribusi pada Smart Neighborhood! 🎉

## Cara Berkontribusi

### 1. Fork & Clone Repository

```bash
git clone https://github.com/your-username/smartneighbour.git
cd smartneighbour
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat Branch Baru

```bash
git checkout -b feature/nama-fitur-anda
# atau
git checkout -b fix/nama-bug-yang-diperbaiki
```

### 4. Lakukan Perubahan

- Tulis code yang clean dan mudah dibaca
- Follow conventions yang ada
- Tambahkan comments jika diperlukan
- Update dokumentasi jika ada perubahan API atau fitur

### 5. Test Perubahan Anda

```bash
npm run dev
```

Pastikan:
- ✅ Aplikasi berjalan tanpa error
- ✅ Fitur baru berfungsi dengan baik
- ✅ Tidak ada breaking changes pada fitur existing
- ✅ Responsive di berbagai ukuran layar

### 6. Commit Changes

Gunakan commit message yang deskriptif:

```bash
git add .
git commit -m "feat: menambahkan fitur export data ke Excel"
# atau
git commit -m "fix: memperbaiki bug pada form login"
```

#### Commit Message Convention

- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Update dokumentasi
- `style:` - Perubahan formatting/styling
- `refactor:` - Refactoring code
- `test:` - Menambahkan tests
- `chore:` - Maintenance tasks

### 7. Push ke Repository Anda

```bash
git push origin feature/nama-fitur-anda
```

### 8. Buat Pull Request

- Buka repository Anda di GitHub
- Click "New Pull Request"
- Pilih branch Anda
- Isi deskripsi yang jelas tentang perubahan Anda
- Submit pull request

## Code Style Guidelines

### TypeScript/React

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
}

export function UserCard({ name, email }: UserProps) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}

// ❌ Avoid
function UserCard(props) {
  return <div><h3>{props.name}</h3></div>;
}
```

### Styling

- Gunakan Tailwind CSS utility classes
- Gunakan custom classes di `globals.css` untuk styling yang reusable
- Ikuti design system yang ada (colors, spacing, typography)

### File Naming

- Components: PascalCase (`UserCard.tsx`)
- Utilities: camelCase (`dateUtils.ts`)
- Pages: kebab-case dalam folder structure
- Constants: UPPER_SNAKE_CASE untuk values

### Folder Structure

```
app/              - Next.js pages
components/       - Reusable UI components
lib/              - Utilities, helpers, constants
hooks/            - Custom React hooks
services/         - API services
types/            - TypeScript types
```

## Reporting Issues

Jika menemukan bug atau punya ide fitur:

1. Check existing issues dulu
2. Jika belum ada, buat issue baru
3. Gunakan template yang sesuai
4. Berikan deskripsi yang jelas dan detail

### Bug Report Template

```markdown
**Describe the bug**
Deskripsi singkat tentang bug

**To Reproduce**
Steps untuk reproduce bug:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
Apa yang seharusnya terjadi

**Screenshots**
Jika ada, tambahkan screenshot

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Deskripsi masalah yang ingin diselesaikan

**Describe the solution you'd like**
Deskripsi fitur yang diinginkan

**Additional context**
Informasi tambahan, mockups, atau references
```

## Questions?

Jika ada pertanyaan, jangan ragu untuk:
- Buat issue dengan label "question"
- Hubungi maintainer

## Code of Conduct

- Be respectful and inclusive
- Constructive feedback
- Help others learn and grow
- Focus on the code, not the person

## Thank You! 🙏

Setiap kontribusi, sekecil apapun, sangat berarti untuk project ini!
