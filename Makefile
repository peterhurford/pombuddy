.PHONY: setup dev build lint clean

# First-time setup: install deps, create .env.local if missing, remind about Supabase
setup:
	@echo "Installing dependencies..."
	npm install
	@if [ ! -f .env.local ]; then \
		cp .env.local.example .env.local; \
		echo ""; \
		echo "Created .env.local from .env.local.example."; \
		echo "Edit .env.local and fill in your Supabase credentials:"; \
		echo "  NEXT_PUBLIC_SUPABASE_URL"; \
		echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"; \
		echo ""; \
		echo "Then run the database migration:"; \
		echo "  Paste supabase/migrations/001_initial.sql into the Supabase SQL Editor"; \
		echo "  (https://supabase.com/dashboard → your project → SQL Editor)"; \
	else \
		echo ".env.local already exists, skipping."; \
	fi
	@echo ""
	@echo "Setup complete. Run 'make dev' to start the dev server."

# Start development server
dev:
	npm run dev

# Production build
build:
	npm run build

# Run linter
lint:
	npm run lint

# Remove build artifacts
clean:
	rm -rf .next node_modules
