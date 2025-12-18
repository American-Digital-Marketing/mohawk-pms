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

-- junction tables are compounds of the table names, ordered alphabetically
-- section_2 base_tables
-- 2.0 component tables
-- ============================================
-- entity table
-- ============================================
CREATE TABLE IF NOT EXISTS entity (
  -- WARN: change me back!
  id bigserial PRIMARY KEY
);

-- ============================================
-- color_swatch table
-- ============================================
CREATE TABLE IF NOT EXISTS color_swatch (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , merchandised_color_id uuid NOT NULL -- do we need this?
  , image_id uuid NOT NULL
);

-- ============================================
-- color_theme table
-- ============================================
CREATE TABLE IF NOT EXISTS color_theme (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , name text NOT NULL UNIQUE
);

-- ============================================
-- currency table
-- ============================================
CREATE TABLE IF NOT EXISTS currency (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , code text NOT NULL UNIQUE
);

-- ============================================
-- description table
-- ============================================
CREATE TABLE IF NOT EXISTS description (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , contents text NOT NULL UNIQUE
);

-- ============================================
-- discontinued_product table
-- ============================================
CREATE TABLE IF NOT EXISTS discontinued_product (
  entity_id bigint PRIMARY KEY
);

-- ============================================
-- entity_color_swatch table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_color_swatch (
  entity_id bigint NOT NULL
  , color_swatch_id uuid NOT NULL
  , PRIMARY KEY (entity_id , color_swatch_id)
);

-- ============================================
-- entity_color_theme table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_color_theme (
  entity_id bigint NOT NULL
  , color_theme_id uuid NOT NULL
  , PRIMARY KEY (entity_id , color_theme_id)
);

-- ============================================
-- entity_description table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_description (
  entity_id bigint NOT NULL
  , description_id uuid NOT NULL
  , PRIMARY KEY (entity_id , description_id)
);

-- ============================================
-- entity_feature table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_feature (
  entity_id bigint NOT NULL
  , feature_id uuid NOT NULL
  , PRIMARY KEY (entity_id , feature_id)
);

-- ============================================
-- entity_image table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_image (
  entity_id bigint NOT NULL
  , sort_order integer NOT NULL
  , image_id uuid NOT NULL
  , PRIMARY KEY (entity_id , image_id)
);

-- ============================================
-- entity_merchandised_color table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_merchandised_color (
  merchandised_color_id uuid NOT NULL
  , entity_id bigint NOT NULL UNIQUE
  , PRIMARY KEY (entity_id , merchandised_color_id)
);

-- ============================================
-- entity_pattern table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_pattern (
  entity_id bigint NOT NULL
  , pattern_id uuid NOT NULL
  , PRIMARY KEY (entity_id , pattern_id)
);

-- ============================================
-- entity_primary_color table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_primary_color (
  entity_id bigint NOT NULL
  , primary_color_id uuid NOT NULL
  , PRIMARY KEY (entity_id , primary_color_id)
);

-- ============================================
-- entity_style table
-- ============================================
CREATE TABLE IF NOT EXISTS entity_style (
  entity_id bigint NOT NULL
  , style_id uuid NOT NULL
  , PRIMARY KEY (entity_id , style_id)
);

-- ============================================
-- feature table
-- ============================================
CREATE TABLE IF NOT EXISTS feature (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , contents text NOT NULL UNIQUE
);

-- ============================================
-- featured_image table
-- ============================================
CREATE TABLE IF NOT EXISTS featured_image (
  entity_id bigint NOT NULL
  , image_id uuid NOT NULL
  , PRIMARY KEY (entity_id , image_id)
);

-- ============================================
-- file table
-- ============================================
CREATE TABLE IF NOT EXISTS file (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , source text NOT NULL UNIQUE
);

-- ============================================
-- image table
-- ============================================
CREATE TABLE IF NOT EXISTS image (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , file_id uuid NOT NULL UNIQUE
);

-- ============================================
-- inventory table
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , entity_id bigint NOT NULL UNIQUE
  , stock integer NOT NULL
);

-- ============================================
-- lifestyle_image table
-- ============================================
CREATE TABLE IF NOT EXISTS lifestyle_image (
  entity_id bigint NOT NULL
  , image_id uuid NOT NULL
  , PRIMARY KEY (entity_id , image_id)
);

-- ============================================
-- merchandised_color table
-- ============================================
CREATE TABLE IF NOT EXISTS merchandised_color (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , name text NOT NULL UNIQUE
);

-- ============================================
-- pattern table
-- ============================================
CREATE TABLE IF NOT EXISTS pattern (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , name text NOT NULL UNIQUE
);

-- ============================================
-- price table
-- ============================================
CREATE TABLE IF NOT EXISTS price (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , entity_id bigint NOT NULL UNIQUE
  , value integer NOT NULL
  , currency_id uuid NOT NULL
  , UNIQUE (entity_id , currency_id)
);

-- ============================================
-- primary_color table
-- ============================================
CREATE TABLE IF NOT EXISTS primary_color (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , name text NOT NULL UNIQUE
);

-- ============================================
-- style table
-- ============================================
CREATE TABLE IF NOT EXISTS style (
  id uuid DEFAULT uuidv7 () PRIMARY KEY
  , name text NOT NULL UNIQUE
);

-- section_3 columns
-- no column changes
-- section_4 constraints
DO $$
BEGIN
  -- ============================================
  -- color_swatch constraints
  -- ============================================
  -- color_swatch.merch_color_fk
  BEGIN
    ALTER TABLE color_swatch
      ADD CONSTRAINT merch_color_fk FOREIGN KEY (merchandised_color_id) REFERENCES merchandised_color (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint color_swatch.merch_color_fk already exists';
  END;
  BEGIN
    ALTER TABLE color_swatch
      ADD CONSTRAINT image_fk FOREIGN KEY (image_id) REFERENCES image (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint color_swatch.image_fk already exists';
  END;
  -- ============================================
  -- description constraints
  -- ============================================
  -- [none]
  -- ============================================
  -- discontinued_product constraints
  -- ============================================
  BEGIN
    ALTER TABLE discontinued_product
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint discontinued_product.entity_fk already exists';
  END;
  -- ============================================
  -- entity_color_swatch constraints
  -- ============================================
  -- entity_color_swatch.entity_fk
  BEGIN
    ALTER TABLE entity_color_swatch
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_color_swatch.entity_fk already exists';
  END;
  -- entity_color_swatch.swatch_fk
  BEGIN
    ALTER TABLE entity_color_swatch
      ADD CONSTRAINT swatch_fk FOREIGN KEY (color_swatch_id) REFERENCES color_swatch (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_color_swatch.swatch_fk already exists';
  END;
  -- ============================================
  -- entity_color_theme constraints
  -- ============================================
  -- entity_color_theme.entity_fk
  BEGIN
    ALTER TABLE entity_color_theme
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_color_theme.entity_fk already exists';
  END;
  -- entity_color_theme.theme_fk
  BEGIN
    ALTER TABLE entity_color_theme
      ADD CONSTRAINT theme_fk FOREIGN KEY (color_theme_id) REFERENCES color_theme (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_color_theme.theme_fk already exists';
  END;
  -- ============================================
  -- entity_description constraints
  -- ============================================
  -- entity_description.entity_fk
  BEGIN
    ALTER TABLE entity_description
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_description.entity_fk already exists';
  END;
  -- entity_description.description_fk
  BEGIN
    ALTER TABLE entity_description
      ADD CONSTRAINT description_fk FOREIGN KEY (description_id) REFERENCES description (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_description.description_fk already exists';
  END;
  -- ============================================
  -- entity_feature constraints
  -- ============================================
  -- entity_feature.entity_fk
  BEGIN
    ALTER TABLE entity_feature
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_feature.entity_fk already exists';
  END;
  -- entity_feature.feature_fk
  BEGIN
    ALTER TABLE entity_feature
      ADD CONSTRAINT feature_fk FOREIGN KEY (feature_id) REFERENCES feature (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_feature.feature_fk already exists';
  END;
  -- ============================================
  -- entity_image constraints
  -- ============================================
  -- entity_image.entity_fk
  BEGIN
    ALTER TABLE entity_image
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_image.entity_fk already exists';
  END;
  -- entity_image.image_fk
  BEGIN
    ALTER TABLE entity_image
      ADD CONSTRAINT image_fk FOREIGN KEY (image_id) REFERENCES image (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_image.image_fk already exists';
  END;
  -- ============================================
  -- entity_merchandised_color constraints
  -- ============================================
  -- entity_merchandised_color.entity_fk
  BEGIN
    ALTER TABLE entity_merchandised_color
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_merchandised_color.entity_fk already exists';
  END;
  -- entity_merchandised_color.merch_fk
  BEGIN
    ALTER TABLE entity_merchandised_color
      ADD CONSTRAINT merch_fk FOREIGN KEY (merchandised_color_id) REFERENCES merchandised_color (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_merchandised_color.merch_fk already exists';
  END;
  -- ============================================
  -- entity_pattern constraints
  -- ============================================
  -- entity_pattern.entity_fk
  BEGIN
    ALTER TABLE entity_pattern
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_pattern.entity_fk already exists';
  END;
  -- entity_pattern.pattern_fk
  BEGIN
    ALTER TABLE entity_pattern
      ADD CONSTRAINT pattern_fk FOREIGN KEY (pattern_id) REFERENCES pattern (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_pattern.pattern_fk already exists';
  END;
  -- ============================================
  -- entity_primary_color constraints
  -- ============================================
  -- entity_primary_color.entity_fk
  BEGIN
    ALTER TABLE entity_primary_color
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_primary_color.entity_fk already exists';
  END;
  -- entity_primary_color.primary_fk
  BEGIN
    ALTER TABLE entity_primary_color
      ADD CONSTRAINT primary_fk FOREIGN KEY (primary_color_id) REFERENCES primary_color (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_primary_color.primary_fk already exists';
  END;
  -- ============================================
  -- entity_style constraints
  -- ============================================
  -- entity_style.entity_fk
  BEGIN
    ALTER TABLE entity_style
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_style.entity_fk already exists';
  END;
  -- entity_style.style_fk
  BEGIN
    ALTER TABLE entity_style
      ADD CONSTRAINT style_fk FOREIGN KEY (style_id) REFERENCES style (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint entity_style.style_fk already exists';
  END;
  -- ============================================
  -- feature constraints
  -- ============================================
  -- [none]
  -- ============================================
  -- featured_image constraints
  -- ============================================
  -- featured_image.entity_fk
  BEGIN
    ALTER TABLE featured_image
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint featured_image.entity_fk already exists';
  END;
  -- featured_image.image_fk
  BEGIN
    ALTER TABLE featured_image
      ADD CONSTRAINT image_fk FOREIGN KEY (image_id) REFERENCES image (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint featured_image.image_fk already exists';
  END;
  -- ============================================
  -- image constraints
  -- ============================================
  BEGIN
    ALTER TABLE image
      ADD CONSTRAINT file_fk FOREIGN KEY (file_id) REFERENCES file (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint image.file_fk already exists';
  END;
  -- ============================================
  -- inventory constraints
  -- ============================================
  BEGIN
    ALTER TABLE inventory
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint inventory.entity_fk already exists';
  END;
  -- ============================================
  -- lifestyle_image constraints
  -- ============================================
  -- lifestyle_image.entity_fk
  BEGIN
    ALTER TABLE lifestyle_image
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint lifestyle_image.entity_fk already exists';
  END;
  -- lifestyle_image.image_fk
  BEGIN
    ALTER TABLE lifestyle_image
      ADD CONSTRAINT image_fk FOREIGN KEY (image_id) REFERENCES image (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint lifestyle_image.image_fk already exists';
  END;
  -- ============================================
  -- merchandised_color constraints
  -- ============================================
  -- [none]
  -- ============================================
  -- pattern constraints
  -- ============================================
  -- [none]
  -- ============================================
  -- price constraints
  -- ============================================
  -- price.entity_fk
  BEGIN
    ALTER TABLE price
      ADD CONSTRAINT entity_fk FOREIGN KEY (entity_id) REFERENCES entity (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint price.entity_fk already exists';
  END;
  -- price.currency_fk
  BEGIN
    ALTER TABLE price
      ADD CONSTRAINT currency_fk FOREIGN KEY (currency_id) REFERENCES currency (id);
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint price.currency_fk already exists';
  END;
  -- ============================================
  -- style constraints
  -- ============================================
  -- [none]
  -- end constraint exception handling
END
$$;

-- section_5 indices
-- section_6 views
-- section_7 functions
-- section_8 triggers
