// Project titles read "Product – what it is". Pages lead with the product name and set
// the descriptor under it; the browser tab and share cards keep the full title.
export function splitTitle(title: string): { name: string; descriptor?: string } {
  const [name, ...rest] = title.split(' – ');
  return { name, descriptor: rest.length ? rest.join(' – ') : undefined };
}
