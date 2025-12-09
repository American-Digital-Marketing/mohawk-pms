-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- ! THIS FILE MUST BE IDEMPOTENT !
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- 
-- Order of operations:
-- section_0 roles_and_users
-- section_1 schemas_or_extensions
-- section_2 base_tables
-- section_3 columns
-- section_4 constraints
-- section_5 indices
-- section_6 views
-- section_7 functions
-- section_8 triggers
-- 
-- BEGIN SCHEMA DEFINITION
-- 
-- section_0 roles_and_users
-- none
-- section_1 schemas_or_extensions
CREATE SCHEMA IF NOT EXISTS adm;

-- section_2 base_tables
-- 2.0 component tables
-- ============================================
-- entities table
-- ============================================
CREATE TABLE IF NOT EXISTS entities (
  id bigserial PRIMARY KEY
);

-- ============================================
-- color_swatches table
-- ============================================
CREATE TABLE IF NOT EXISTS color_swatches (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL UNIQUE,
  merchandised_color_id bigint NOT NULL,
);

-- ============================================
-- color_theme_primary_color table
-- ============================================
CREATE TABLE IF NOT EXISTS color_theme_primary_color (
  color_theme_id bigint NOT NULL,
  primary_color_id bigint NOT NULL,
  PRIMARY KEY (color_theme_id, primary_color_id),
);

-- ============================================
-- color_themes table
-- ============================================
CREATE TABLE IF NOT EXISTS color_themes (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- ============================================
-- currencies table
-- ============================================
CREATE TABLE IF NOT EXISTS currencies (
  id bigserial PRIMARY KEY,
  code text NOT NULL UNIQUE
);

-- ============================================
-- descriptions table
-- ============================================
CREATE TABLE IF NOT EXISTS descriptions (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL,
  contents text NOT NULL,
);

-- ============================================
-- discontinued_products table
-- ============================================
CREATE TABLE IF NOT EXISTS discontinued_products (
  entity_id bigint PRIMARY KEY,
);

-- ============================================
-- entity_color_theme table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_color_theme (
  entity_id bigint NOT NULL,
  color_theme_id bigint NOT NULL,
  PRIMARY KEY (entity_id, color_theme_id),
);

-- ============================================
-- entity_feature table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_feature (
  entity_id bigint NOT NULL,
  feature_id bigint NOT NULL,
  PRIMARY KEY (entity_id, feature_id),
);

-- ============================================
-- entity_merchandised_color table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_merchandised_color (
  merchandised_color_id bigint NOT NULL,
  entity_id bigint NOT NULL UNIQUE,
  PRIMARY KEY (merchandised_color_id, entity_id),
);

-- ============================================
-- entity_primary_color table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_primary_color (
  entity_id bigint NOT NULL,
  primary_color_id bigint NOT NULL,
  PRIMARY KEY (entity_id, primary_color_id),
);

-- ============================================
-- features table
-- ============================================
CREATE TABLE IF NOT EXISTS features (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL,
);

-- ============================================
-- featured_images table
-- ============================================
CREATE TABLE IF NOT EXISTS featured_images (
  entity_id bigint NOT NULL,
  image_id bigint NOT NULL,
  PRIMARY KEY (entity_id, image_id),
);

-- ============================================
-- files table
-- ============================================
CREATE TABLE IF NOT EXISTS files (
  id bigserial PRIMARY KEY,
  source text NOT NULL UNIQUE
);

-- ============================================
-- images table
-- ============================================
CREATE TABLE IF NOT EXISTS images (
  id bigserial PRIMARY KEY,
  file_id bigint NOT NULL,
);

-- ============================================
-- inventory_levels table
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_levels (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL UNIQUE,
  stock integer NOT NULL,
);

-- ============================================
-- lifestyle_images table
-- ============================================
CREATE TABLE IF NOT EXISTS lifestyle_images (
  entity_id bigint NOT NULL,
  image_id bigint NOT NULL,
  PRIMARY KEY (entity_id, image_id),
);

-- ============================================
-- merchandised_colors table
-- ============================================
CREATE TABLE IF NOT EXISTS merchandised_colors (
  id bigserial PRIMARY KEY,
  primary_color_id bigint NOT NULL,
  color_theme_id bigint NOT NULL,
  name text NOT NULL UNIQUE,
);

-- ============================================
-- patterns table
-- ============================================
CREATE TABLE IF NOT EXISTS patterns (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
);

-- ============================================
-- prices table
-- ============================================
CREATE TABLE IF NOT EXISTS prices (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL,
  value integer NOT NULL,
  currency_id bigint NOT NULL,
);

-- ============================================
-- primary_colors table
-- ============================================
CREATE TABLE IF NOT EXISTS primary_colors (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- ============================================
-- styles table
-- ============================================
CREATE TABLE IF NOT EXISTS styles (
  id bigserial PRIMARY KEY,
  entity_id bigint NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
);

-- section_3 columns
-- no column changes
-- section_4 constraints
DO $$
BEGIN
  -- ============================================
  -- color_swatches constraints
  -- ============================================
  -- color_swatches.entity_fk
  BEGIN
    ALTER TABLE color_swatches
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint color_swatches.entity_fk already exists';
  END;
  -- color_swatches.merch_color_fk
  BEGIN
    ALTER TABLE color_swatches
      ADD CONSTRAINT merch_color_fk FOREIGN KEY (merchandised_color_id) REFERENCES merchandised_colors (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint color_swatches.merch_color_fk already exists';
  END;
  -- ============================================
  -- color_theme_primary_color constraints
  -- ============================================
  -- ctpc.theme_fk
  BEGIN
    ALTER TABLE color_theme_primary_color
      ADD CONSTRAINT theme_fk FOREIGN KEY (color_theme_id) REFERENCES color_themes (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint color_theme_primary_color.theme_fk already exists';
  END;
  -- ctpc.primary_fk
  BEGIN
    ALTER TABLE color_theme_primary_color
      ADD CONSTRAINT primary_fk FOREIGN KEY (primary_color_id) REFERENCES primary_colors (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint color_theme_primary_color.primary_fk already exists';
  END;
  -- ============================================
  -- descriptions constraints
  -- ============================================
  BEGIN
    ALTER TABLE descriptions
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint descriptions.entity_fk already exists';
  END;
  -- ============================================
  -- discontinued_products constraints
  -- ============================================
  BEGIN
    ALTER TABLE discontinued_products
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint discontinued_products.entity_fk already exists';
  END;
  -- ============================================
  -- entity_color_theme constraints
  -- ============================================
  -- entity_color_theme.entity_fk
  BEGIN
    ALTER TABLE entity_color_theme
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_color_theme.entity_fk already exists';
  END;
  -- entity_color_theme.theme_fk
  BEGIN
    ALTER TABLE entity_color_theme
      ADD CONSTRAINT theme_fk FOREIGN KEY (color_theme_id) REFERENCES color_themes (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_color_theme.theme_fk already exists';
  END;
  -- ============================================
  -- entity_feature constraints
  -- ============================================
  -- entity_feature.entity_fk
  BEGIN
    ALTER TABLE entity_feature
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_feature.entity_fk already exists';
  END;
  -- entity_feature.feature_fk
  BEGIN
    ALTER TABLE entity_feature
      ADD CONSTRAINT feature_fk FOREIGN KEY (feature_id) REFERENCES features (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_feature.feature_fk already exists';
  END;
  -- ============================================
  -- entity_merchandised_color constraints
  -- ============================================
  -- entity_merchandised_color.entity_fk
  BEGIN
    ALTER TABLE entity_merchandised_color
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_merchandised_color.entity_fk already exists';
  END;
  -- entity_merchandised_color.merch_fk
  BEGIN
    ALTER TABLE entity_merchandised_color
      ADD CONSTRAINT merch_fk FOREIGN KEY (merchandised_color_id) REFERENCES merchandised_colors (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_merchandised_color.merch_fk already exists';
  END;
  -- ============================================
  -- entity_primary_color constraints
  -- ============================================
  -- entity_primary_color.entity_fk
  BEGIN
    ALTER TABLE entity_primary_color
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_primary_color.entity_fk already exists';
  END;
  -- entity_primary_color.primary_fk
  BEGIN
    ALTER TABLE entity_primary_color
      ADD CONSTRAINT primary_fk FOREIGN KEY (primary_color_id) REFERENCES primary_colors (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_primary_color.primary_fk already exists';
  END;
  -- ============================================
  -- features constraints
  -- ============================================
  BEGIN
    ALTER TABLE features
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint features.entity_fk already exists';
  END;
  -- ============================================
  -- featured_images constraints
  -- ============================================
  -- featured_images.entity_fk
  BEGIN
    ALTER TABLE featured_images
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint featured_images.entity_fk already exists';
  END;
  -- featured_images.image_fk
  BEGIN
    ALTER TABLE featured_images
      ADD CONSTRAINT image_fk FOREIGN KEY (image_id) REFERENCES images (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint featured_images.image_fk already exists';
  END;
  -- ============================================
  -- images constraints
  -- ============================================
  BEGIN
    ALTER TABLE images
      ADD CONSTRAINT file_fk FOREIGN KEY (file_id) REFERENCES files (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint images.file_fk already exists';
  END;
  -- ============================================
  -- inventory_levels constraints
  -- ============================================
  BEGIN
    ALTER TABLE inventory_levels
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint inventory_levels.entity_fk already exists';
  END;
  -- ============================================
  -- lifestyle_images constraints
  -- ============================================
  -- lifestyle_images.entity_fk
  BEGIN
    ALTER TABLE lifestyle_images
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint lifestyle_images.entity_fk already exists';
  END;
  -- lifestyle_images.image_fk
  BEGIN
    ALTER TABLE lifestyle_images
      ADD CONSTRAINT image_fk FOREIGN KEY (image_id) REFERENCES images (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint lifestyle_images.image_fk already exists';
  END;
  -- ============================================
  -- merchandised_colors constraints
  -- ============================================
  -- merchandised_colors.primary_fk
  BEGIN
    ALTER TABLE merchandised_colors
      ADD CONSTRAINT primary_fk FOREIGN KEY (primary_color_id) REFERENCES primary_colors (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint merchandised_colors.primary_fk already exists';
  END;
  -- merchandised_colors.theme_fk
  BEGIN
    ALTER TABLE merchandised_colors
      ADD CONSTRAINT theme_fk FOREIGN KEY (color_theme_id) REFERENCES color_themes (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint merchandised_colors.theme_fk already exists';
  END;
  -- ============================================
  -- patterns constraints
  -- ============================================
  BEGIN
    ALTER TABLE patterns
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint patterns.entity_fk already exists';
  END;
  -- ============================================
  -- prices constraints
  -- ============================================
  -- prices.entity_fk
  BEGIN
    ALTER TABLE prices
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint prices.entity_fk already exists';
  END;
  -- prices.currency_fk
  BEGIN
    ALTER TABLE prices
      ADD CONSTRAINT currency_fk FOREIGN KEY (currency_id) REFERENCES currencies (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint prices.currency_fk already exists';
  END;
  -- ============================================
  -- styles constraints
  -- ============================================
  BEGIN
    ALTER TABLE styles
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entities (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint styles.entity_fk already exists';
  END;
  -- end constraint exception handling
END
$$;

-- section_5 indices
-- section_6 views
-- section_7 functions
-- section_8 triggers
