import os, re
SCHEMA_DIR = 'apps/api/prisma/schema'
all_models = []
for fname in sorted(os.listdir(SCHEMA_DIR)):
    if not fname.endswith('.prisma') or fname == 'base.prisma':
        continue
    with open(os.path.join(SCHEMA_DIR, fname)) as f:
        content = f.read()
    models = re.findall(r'model\s+(\w+)\s+\{', content)
    for m in models:
        all_models.append((fname, m))
print(f"Total parsed: {len(all_models)}")
