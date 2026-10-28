import { execFileSync } from 'node:child_process';

// Commit dates of source files, so pages can say when they were first published and last changed.
// Without git (or for a file never committed) there is no date, and callers leave the field out.
const git = (args: string[]) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim() || undefined;
  } catch {
    return undefined;
  }
};

/** The most recent commit touching any of the files. */
export const lastCommitDate = (...files: string[]) => git(['log', '-1', '--format=%cI', '--', ...files]);

/** The commit that first added the file. */
export const firstCommitDate = (file: string) =>
  git(['log', '--diff-filter=A', '--follow', '--format=%cI', '--', file])
    ?.split(/\r?\n/)
    .at(-1);
