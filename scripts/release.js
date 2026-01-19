const fs = require('fs/promises');
const path = require('path');

const targets = {
  'simon-v1-webby': {
    sourceRoot: 'simon/v1-webby',
    outputRoot: 'docs/simon-v1-webby',
    files: [
      { src: 'src/index.html', dest: 'index.html' },
      { src: 'src/styles.css', dest: 'styles.css' },
      { src: 'src/script.js', dest: 'script.js' },
      { src: 'src/logic.js', dest: 'logic.js' },
    ],
    copyDirs: [
      { src: 'src/icons', dest: 'icons', suffix: '.svg' },
    ],
  },
};

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyFileWithTransform(srcPath, destPath, transform) {
  const content = await fs.readFile(srcPath, 'utf8');
  const output = transform ? transform(content) : content;
  await fs.writeFile(destPath, output, 'utf8');
}

async function copyDirFiltered(srcDir, destDir, suffix) {
  await ensureDir(destDir);
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
      .map((entry) => {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        return fs.copyFile(srcPath, destPath);
      })
  );
}

async function release(targetName, options) {
  const target = targets[targetName];
  if (!target) {
    const names = Object.keys(targets);
    throw new Error(
      `Unknown release target "${targetName}". Available targets: ${names.join(', ')}`
    );
  }

  const sourceRoot = path.resolve(process.cwd(), target.sourceRoot);
  const outputRoot = path.resolve(process.cwd(), target.outputRoot);

  if (options.dryRun) {
    console.log(`[dry-run] remove ${target.outputRoot}`);
  } else {
    await fs.rm(outputRoot, { recursive: true, force: true });
    await ensureDir(outputRoot);
  }

  for (const file of target.files) {
    const srcPath = path.join(sourceRoot, file.src);
    const destPath = path.join(outputRoot, file.dest);
    if (options.dryRun) {
      console.log(`[dry-run] copy ${file.src} -> ${file.dest}`);
    } else {
      await copyFileWithTransform(srcPath, destPath, file.transform);
    }
  }

  for (const dir of target.copyDirs) {
    const srcDir = path.join(sourceRoot, dir.src);
    const destDir = path.join(outputRoot, dir.dest);
    if (options.dryRun) {
      console.log(`[dry-run] copy ${dir.src}/*${dir.suffix} -> ${dir.dest}/`);
    } else {
      await copyDirFiltered(srcDir, destDir, dir.suffix);
    }
  }

  console.log(`${options.dryRun ? 'Dry-run complete' : 'Release complete'}: ${target.outputRoot}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetName = args.find((arg) => !arg.startsWith('-'));
  if (!targetName) {
    const names = Object.keys(targets).join(', ');
    console.log(`Usage: node scripts/release.js <target> [--dry-run]`);
    console.log(`Available targets: ${names}`);
    process.exit(1);
  }

  await release(targetName, { dryRun });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
