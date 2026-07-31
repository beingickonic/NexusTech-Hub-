/* eslint-disable no-console */
/**
 * NexusTech Hub — Brand Theme Refactor
 * Replaces hardcoded Tailwind color classes with official design tokens.
 *
 * Ordered longest-first so `bg-orange-500` is not corrupted by `bg-orange-50`,
 * and paired light+dark patterns collapse into single theme-aware tokens.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const EXTENSIONS = ['.jsx', '.js'];

// Replacement map — ordered (applied top-to-bottom).
// NOTE: keep more specific patterns ABOVE less specific ones.
const REPLACEMENTS = [
  // ══ Wave 7 (runs FIRST): ordering-safe repair + semantic completions ══
  // Repairs double-opacity corruptions introduced by earlier waves:
  ['dark:bg-nexus-info/100/30', 'dark:bg-nexus-info/30'],
  ['dark:bg-nexus-info/100/20', 'dark:bg-nexus-info/20'],
  ['dark:bg-nexus-success/100/30', 'dark:bg-nexus-success/30'],
  ['dark:bg-nexus-error/50/30', 'dark:bg-nexus-error/30'],
  ['dark:bg-nexus-error/50/20', 'dark:bg-nexus-error/20'],
  ['bg-nexus-info/100/30', 'bg-nexus-info/30'],
  ['bg-nexus-info/100/20', 'bg-nexus-info/20'],
  ['bg-nexus-success/100', 'bg-nexus-success'],
  ['bg-nexus-error/50/10', 'bg-nexus-error/10'],
  ['bg-nexus-error/50/20', 'bg-nexus-error/20'],
  ['bg-nexus-error/50/30', 'bg-nexus-error/30'],
  ['bg-nexus-error/50', 'bg-nexus-error'],
  ['bg-nexus-success/100', 'bg-nexus-success'],
  // ── Green → success ──
  ['bg-green-100 text-green-700 dark:bg-nexus-success/20 dark:text-green-400', 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success'],
  ['bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/30 dark:text-nexus-success'],
  ['bg-green-50 text-green-700 border-green-200 dark:bg-nexus-success/10 dark:text-green-400 dark:border-green-500/20', 'bg-nexus-success/5 text-nexus-success border-nexus-success/20 dark:bg-nexus-success/10 dark:text-nexus-success dark:border-nexus-success/20'],
  ['bg-green-50 text-green-600 hover:bg-green-100 dark:bg-nexus-success/10 dark:text-green-400 dark:hover:bg-nexus-success/20', 'bg-nexus-success/5 text-nexus-success hover:bg-nexus-success/10 dark:bg-nexus-success/10 dark:text-nexus-success dark:hover:bg-nexus-success/20'],
  ['bg-green-50 text-green-500', 'bg-nexus-success/5 text-nexus-success'],
  ['bg-green-50 dark:bg-green-900/20', 'bg-nexus-success/5 dark:bg-nexus-success/20'],
  ['bg-green-100', 'bg-nexus-success/10'],
  ['bg-green-50', 'bg-nexus-success/5'],
  ['bg-green-500/10', 'bg-nexus-success/10'],
  ['bg-green-500', 'bg-nexus-success'],
  ['bg-green-900/20', 'bg-nexus-success/20'],
  ['hover:bg-green-100', 'hover:bg-nexus-success/10'],
  ['hover:bg-green-50 dark:hover:bg-nexus-success/10', 'hover:bg-nexus-success/5 dark:hover:bg-nexus-success/10'],
  ['text-green-700 dark:text-green-400', 'text-nexus-success'],
  ['text-green-700', 'text-nexus-success'],
  ['text-green-600', 'text-nexus-success'],
  ['text-green-500', 'text-nexus-success'],
  ['text-green-400', 'text-nexus-success'],
  ['dark:text-green-400', 'dark:text-nexus-success'],
  ['hover:text-green-500', 'hover:text-nexus-success'],
  ['border-green-200', 'border-nexus-success/20'],
  ['border-green-500/20', 'border-nexus-success/20'],
  ['dark:border-green-800/30', 'dark:border-nexus-success/30'],
  ['shadow-green-500/30', 'shadow-nexus-success/30'],
  // ── Rose → error ──
  ['bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400', 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error'],
  ['text-rose-600 dark:text-rose-400', 'text-nexus-error'],
  ['text-rose-700 dark:text-rose-400', 'text-nexus-error'],
  ['text-rose-500', 'text-nexus-error'],
  ['text-rose-600', 'text-nexus-error'],
  ['text-rose-700', 'text-nexus-error'],
  ['text-rose-400', 'text-nexus-error'],
  ['bg-rose-600', 'bg-nexus-error'],
  ['hover:bg-rose-600', 'hover:bg-nexus-error'],
  ['bg-rose-500/20', 'bg-nexus-error/20'],
  ['bg-rose-500/10', 'bg-nexus-error/10'],
  ['bg-rose-100', 'bg-nexus-error/10'],
  ['bg-rose-50', 'bg-nexus-error/5'],
  // ── Remaining red hovers/shadows → error ──
  ['hover:bg-red-600', 'hover:bg-nexus-error'],
  ['shadow-red-500/30', 'shadow-nexus-error/30'],
  ['hover:border-red-500', 'hover:border-nexus-error'],
  ['border-red-500/30', 'border-nexus-error/30'],
  ['border-red-500/20', 'border-nexus-error/20'],
  ['focus:ring-red-500/50', 'focus:ring-nexus-error/50'],
  ['focus:border-red-500', 'focus:border-nexus-error'],
  ['hover:bg-red-200', 'hover:bg-nexus-error/10'],
  ['dark:hover:bg-red-900/40', 'dark:hover:bg-nexus-error/40'],
  ['dark:bg-red-900/40', 'dark:bg-nexus-error/40'],
  ['dark:border-red-800/30', 'dark:border-nexus-error/30'],
  ['dark:border-red-900/50', 'dark:border-nexus-error/50'],
  ['text-red-300', 'text-nexus-error'],
  ['dark:text-red-300', 'dark:text-nexus-error'],
  ['hover:bg-red-100', 'hover:bg-nexus-error/10'],
  // ── Remaining blue hovers/borders → info ──
  ['hover:border-blue-500', 'hover:border-nexus-info'],
  ['hover:border-blue-300', 'hover:border-nexus-info/30'],
  ['border-blue-200', 'border-nexus-info/20'],
  ['border-blue-100 dark:border-blue-800', 'border-nexus-info/10 dark:border-nexus-info/80'],
  ['border-blue-100', 'border-nexus-info/10'],
  ['dark:border-blue-800', 'dark:border-nexus-info/80'],
  ['shadow-blue-500/30', 'shadow-nexus-info/30'],
  ['hover:bg-blue-200 dark:hover:bg-nexus-info/30', 'hover:bg-nexus-info/20 dark:hover:bg-nexus-info/30'],
  ['dark:hover:bg-nexus-info/100/30', 'dark:hover:bg-nexus-info/30'],
  ['text-blue-300', 'text-nexus-info'],
  // ── Remaining emerald hovers/borders/shadows → success ──
  ['hover:bg-emerald-600', 'hover:bg-nexus-success'],
  ['hover:border-emerald-300 dark:hover:border-nexus-success/50', 'hover:border-nexus-success/30 dark:hover:border-nexus-success/50'],
  ['hover:border-emerald-300', 'hover:border-nexus-success/30'],
  ['shadow-emerald-500/30', 'shadow-nexus-success/30'],
  ['border-emerald-200 dark:border-nexus-success/20', 'border-nexus-success/20'],
  ['border-emerald-200', 'border-nexus-success/20'],
  ['dark:border-emerald-500/20', 'dark:border-nexus-success/20'],
  ['dark:text-emerald-300', 'dark:text-nexus-success'],
  ['text-emerald-300', 'text-nexus-success'],
  ['hover:bg-emerald-200 dark:hover:bg-nexus-success/30', 'hover:bg-nexus-success/20 dark:hover:bg-nexus-success/30'],
  // ── Remaining amber → gold ──
  ['hover:bg-amber-600', 'hover:bg-nexus-gold'],
  ['bg-amber-600', 'bg-nexus-gold'],
  ['text-amber-300', 'text-nexus-gold'],
  ['bg-amber-300', 'bg-nexus-gold'],
  ['border-amber-300 dark:border-nexus-gold/30', 'border-nexus-gold/30'],
  ['border-amber-300', 'border-nexus-gold/30'],
  ['border-amber-400', 'border-nexus-gold/40'],
  ['text-amber-600', 'text-nexus-gold'],
  ['text-amber-700', 'text-nexus-gold'],
  ['text-amber-400', 'text-nexus-gold'],
  ['dark:text-amber-400', 'dark:text-nexus-gold'],
  ['dark:text-amber-300', 'dark:text-nexus-gold'],
  ['bg-amber-500/20', 'bg-nexus-gold/20'],
  // ── Hex leftovers → tokens ──
  ['dark:bg-[#0f172a]', 'dark:bg-nexus-bg'],
  ['dark:bg-[#0F172A]', 'dark:bg-nexus-bg'],
  ['dark:border-[#0C1220]', 'dark:border-nexus-bg'],
  ['bg-[#F8FAFC] dark:bg-nexus-bg', 'bg-nexus-surface dark:bg-nexus-bg'],
  ['bg-[#F8FAFC]', 'bg-nexus-surface'],

  // ── Page background legacy hex → tokens ──────────────
  ['bg-[#F4F4F8] dark:bg-dark-bg', 'bg-nexus-surface dark:bg-nexus-bg'],
  ['bg-[#F4F4F8] dark:bg-nexus-surface', 'bg-nexus-surface dark:bg-nexus-bg'],
  ['bg-[#F4F4F8]', 'bg-nexus-surface'],
  ['bg-[#070B1A]', 'bg-nexus-bg'],
  ['bg-[#0F172A]', 'bg-nexus-bg'],
  ['dark:bg-[#070B1A]', 'dark:bg-nexus-bg'],
  ['dark:bg-dark-bg', 'dark:bg-nexus-bg'],
  ['dark:bg-dark-surface', 'dark:bg-nexus-surface'],

  // ── Brand orange → primary tokens (longest first) ────
  ['focus:ring-orange-500/40', 'focus:ring-nexus-primary/40'],
  ['focus:ring-orange-500', 'focus:ring-nexus-primary'],
  ['shadow-orange-500/25', 'shadow-nexus-primary/25'],
  ['bg-orange-600 hover:bg-orange-700', 'bg-nexus-primary hover:bg-nexus-primary-hover'],
  ['hover:bg-orange-600', 'hover:bg-nexus-primary-hover'],
  ['bg-orange-600', 'bg-nexus-primary-hover'],
  ['hover:bg-orange-500', 'hover:bg-nexus-primary'],
  ['bg-orange-500', 'bg-nexus-primary'],
  ['dark:bg-orange-500/10', 'dark:bg-nexus-primary/10'],
  ['dark:bg-orange-500/20', 'dark:bg-nexus-primary/20'],
  ['dark:bg-orange-500/15', 'dark:bg-nexus-primary/15'],
  ['bg-orange-50', 'bg-nexus-primary/10'],
  ['bg-orange-100', 'bg-nexus-primary/15'],
  ['text-orange-700 dark:text-orange-400', 'text-nexus-primary'],
  ['text-orange-600 dark:text-orange-400', 'text-nexus-primary'],
  ['text-orange-400 dark:text-orange-300', 'text-nexus-primary'],
  ['text-orange-400', 'text-nexus-primary'],
  ['dark:text-orange-400', 'dark:text-nexus-primary'],
  ['hover:text-orange-500', 'hover:text-nexus-primary'],
  ['text-orange-600', 'text-nexus-primary'],
  ['text-orange-500', 'text-nexus-primary'],
  ['border-orange-500', 'border-nexus-primary'],
  ['hover:border-orange-500', 'hover:border-nexus-primary'],
  ['dark:hover:border-orange-600', 'dark:hover:border-nexus-primary-hover'],
  ['dark:hover:border-orange-500', 'dark:hover:border-nexus-primary'],
  ['dark:border-orange-500/40', 'dark:border-nexus-primary/40'],
  ['dark:border-orange-500/30', 'dark:border-nexus-primary/30'],
  ['dark:border-orange-500/50', 'dark:border-nexus-primary/50'],
  ['from-orange-400 to-rose-500', 'from-nexus-primary to-nexus-primary-hover'],
  ['from-orange-500 to-rose-500', 'from-nexus-primary to-nexus-primary-hover'],
  ['from-orange-400 to-orange-600', 'from-nexus-primary to-nexus-primary-hover'],
  ['from-orange-500 to-orange-600', 'from-nexus-primary to-nexus-primary-hover'],
  ['via-orange-500', 'via-nexus-primary'],
  ['to-orange-500', 'to-nexus-primary'],

  // ── Heading text (light navy → dark white) ───────────
  ['text-slate-900 dark:text-white', 'text-nexus-heading'],
  ['text-slate-800 dark:text-white', 'text-nexus-heading'],
  ['text-slate-700 dark:text-white', 'text-nexus-heading'],
  ['text-slate-900 dark:text-nexus-textSecondary', 'text-nexus-heading'],
  ['text-gray-900 dark:text-white', 'text-nexus-heading'],

  // ── Secondary / muted text ───────────────────────────
  ['text-slate-600 dark:text-nexus-textSecondary', 'text-nexus-muted'],
  ['text-slate-500 dark:text-nexus-textSecondary', 'text-nexus-muted'],
  ['text-slate-400 dark:text-nexus-textSecondary', 'text-nexus-muted'],
  ['text-slate-500 dark:text-slate-400', 'text-nexus-muted'],
  ['text-slate-600 dark:text-slate-300', 'text-nexus-muted'],
  ['text-slate-500 dark:text-slate-300', 'text-nexus-muted'],
  ['text-slate-600 dark:text-slate-400', 'text-nexus-muted'],
  ['text-slate-600 dark:text-slate-200', 'text-nexus-muted'],
  ['text-gray-600 dark:text-nexus-textSecondary', 'text-nexus-muted'],
  ['text-gray-500 dark:text-gray-400', 'text-nexus-muted'],
  ['text-nexus-textSecondary dark:text-nexus-textSecondary', 'text-nexus-muted'],
  ['text-slate-400', 'text-nexus-muted'],
  ['text-gray-400', 'text-nexus-muted'],
  ['text-gray-500', 'text-nexus-muted'],
  ['placeholder-slate-400', 'placeholder-nexus-muted'],

  // ── Body text ────────────────────────────────────────
  ['text-slate-700 dark:text-slate-200', 'text-nexus-text'],
  ['text-slate-700 dark:text-nexus-textSecondary', 'text-nexus-muted'],
  ['text-slate-600 dark:text-nexus-text', 'text-nexus-muted'],
  ['text-slate-800 dark:text-nexus-textSecondary', 'text-nexus-heading'],
  ['text-slate-300', 'text-nexus-muted'],

  // ── Cards (white ↔ surface) ──────────────────────────
  ['bg-white dark:bg-nexus-surface', 'bg-nexus-card'],
  ['bg-white dark:bg-slate-800/60', 'bg-nexus-card'],
  ['bg-white dark:bg-slate-800/50', 'bg-nexus-card'],
  ['bg-white dark:bg-slate-800/40', 'bg-nexus-card'],
  ['bg-white dark:bg-slate-800', 'bg-nexus-card'],
  ['bg-white/80 dark:bg-nexus-surface/80', 'bg-nexus-card'],
  ['bg-white/90 dark:bg-nexus-surface/90', 'bg-nexus-card'],

  // ── Surfaces ─────────────────────────────────────────
  ['bg-slate-50 dark:bg-nexus-surface/30', 'bg-nexus-surface'],
  ['bg-slate-50 dark:bg-nexus-surface', 'bg-nexus-surface'],
  ['bg-slate-50 dark:bg-slate-800/50', 'bg-nexus-surface'],
  ['bg-slate-50 dark:bg-slate-800', 'bg-nexus-surface'],
  ['bg-slate-100 dark:bg-slate-800/50', 'bg-nexus-surface'],
  ['bg-slate-100 dark:bg-slate-800', 'bg-nexus-surface'],
  ['bg-slate-100 dark:bg-slate-700', 'bg-nexus-surface'],
  ['bg-slate-100 dark:bg-slate-700/50', 'bg-nexus-surface'],
  ['bg-slate-50', 'bg-nexus-surface'],
  ['bg-slate-100', 'bg-nexus-surface'],
  ['dark:bg-slate-800/50', 'dark:bg-nexus-card'],
  ['dark:bg-slate-800/40', 'dark:bg-nexus-card'],
  ['dark:bg-slate-800/30', 'dark:bg-nexus-card'],
  ['dark:bg-slate-800', 'dark:bg-nexus-card'],
  ['dark:bg-slate-700/50', 'dark:bg-nexus-card'],
  ['dark:bg-slate-700', 'dark:bg-nexus-card'],
  ['dark:hover:bg-slate-700', 'dark:hover:bg-nexus-hover'],
  ['dark:hover:bg-slate-800', 'dark:hover:bg-nexus-hover'],
  ['hover:bg-slate-100 dark:hover:bg-slate-800', 'hover:bg-nexus-surface'],
  ['hover:bg-slate-50 dark:hover:bg-slate-800', 'hover:bg-nexus-surface'],
  ['hover:bg-slate-100 dark:hover:bg-slate-700', 'hover:bg-nexus-surface'],
  ['hover:bg-slate-50 dark:hover:bg-slate-700', 'hover:bg-nexus-surface'],
  ['hover:bg-slate-100', 'hover:bg-nexus-surface'],
  ['hover:bg-slate-50', 'hover:bg-nexus-surface'],
  ['dark:hover:bg-white/10', 'dark:hover:bg-nexus-hover'],

  // ── Borders ──────────────────────────────────────────
  ['border-slate-200 dark:border-nexus-border/50', 'border-nexus-border/50'],
  ['border-slate-200 dark:border-nexus-border', 'border-nexus-border'],
  ['border-slate-100 dark:border-nexus-border/50', 'border-nexus-border/50'],
  ['border-slate-100 dark:border-nexus-border', 'border-nexus-border'],
  ['border-slate-300 dark:border-nexus-border', 'border-nexus-border'],
  ['hover:border-slate-300 dark:hover:border-slate-600', 'hover:border-nexus-border'],
  ['hover:border-slate-300 dark:hover:border-slate-500', 'hover:border-nexus-border'],
  ['border-slate-200', 'border-nexus-border'],
  ['border-slate-100', 'border-nexus-border'],
  ['dark:border-nexus-border/50', 'dark:border-nexus-border/50'],

  // ── Gold accent (legacy `accent` usages in classes) ─
  ['text-amber-500 dark:text-amber-400', 'text-nexus-gold'],
  ['text-amber-600 dark:text-amber-400', 'text-nexus-gold'],
  ['bg-amber-500', 'bg-nexus-gold'],
  ['bg-amber-50', 'bg-nexus-gold/10'],
  ['text-amber-500', 'text-nexus-gold'],
  ['border-amber-500', 'border-nexus-gold'],

  // ── Wave 2: remaining grays → tokens ────────────────
  ['text-slate-700 dark:text-gray-300', 'text-nexus-text'],
  ['text-slate-600 dark:text-gray-300', 'text-nexus-muted'],
  ['text-slate-600 dark:text-nexus-muted', 'text-nexus-muted'],
  ['text-slate-500 dark:text-gray-300', 'text-nexus-muted'],
  ['text-slate-400 dark:text-gray-300', 'text-nexus-muted'],
  ['text-slate-700 dark:text-nexus-muted', 'text-nexus-text'],
  ['dark:text-gray-300', 'dark:text-nexus-text'],
  ['dark:text-gray-200', 'dark:text-nexus-text'],
  ['dark:text-gray-100', 'dark:text-nexus-heading'],
  ['hover:text-slate-600 dark:hover:text-gray-200', 'hover:text-nexus-muted'],
  ['hover:text-slate-900 dark:hover:text-white', 'hover:text-nexus-heading'],
  ['dark:group-hover:text-white', 'dark:group-hover:text-nexus-heading'],
  ['group-hover:text-slate-900 dark:group-hover:text-white', 'group-hover:text-nexus-heading'],
  ['group-hover:text-slate-600 dark:text-gray-300', 'group-hover:text-nexus-muted'],
  ['dark:text-slate-600', 'dark:text-nexus-muted'],
  ['dark:text-slate-300', 'dark:text-nexus-text'],

  // ── Toggle / skeleton chips ─────────────────────────
  ['bg-slate-200 dark:bg-nexus-card', 'bg-nexus-surface dark:bg-nexus-card'],
  ['bg-slate-200', 'bg-nexus-surface'],
  ['hover:bg-slate-200 dark:hover:bg-nexus-hover', 'hover:bg-nexus-surface dark:hover:bg-nexus-hover'],
  ['hover:bg-slate-200 dark:hover:bg-slate-600', 'hover:bg-nexus-surface dark:hover:bg-nexus-hover'],
  ['hover:bg-slate-300 dark:hover:bg-slate-600', 'hover:bg-nexus-surface dark:hover:bg-nexus-hover'],
  ['bg-slate-300 dark:bg-gray-600', 'bg-nexus-muted dark:bg-nexus-muted'],
  ['bg-slate-300 dark:bg-slate-600', 'bg-nexus-muted dark:bg-nexus-muted'],
  ['bg-slate-300', 'bg-nexus-muted'],
  ['bg-slate-400', 'bg-nexus-muted'],
  ['dot:bg-slate-400', 'dot:bg-nexus-muted'],
  ['dark:border-[#1F2937]', 'dark:border-nexus-card'],
  ['dark:border-slate-600', 'dark:border-nexus-border'],
  ['dark:border-slate-400', 'dark:border-nexus-border'],
  ['border-slate-300', 'border-nexus-border'],

  // ── Driver / dark-only surfaces → theme-aware ───────
  ['bg-slate-700 text-nexus-textSecondary', 'bg-nexus-card text-nexus-textSecondary'],
  ['bg-slate-800/50', 'bg-nexus-card'],
  ['hover:bg-slate-800', 'hover:bg-nexus-hover'],
  ['bg-slate-800', 'bg-nexus-card'],
  ['dark:hover:bg-white/5', 'dark:hover:bg-nexus-hover'],
  ['dark:bg-white/5', 'dark:bg-nexus-hover'],
  ['dark:bg-black/20', 'dark:bg-nexus-bg'],
  ['hover:bg-white dark:hover:bg-white/5', 'hover:bg-nexus-surface dark:hover:bg-nexus-hover'],
  ['bg-white dark:hover:bg-white/5', 'bg-nexus-card dark:hover:bg-nexus-hover'],
  ['dark:hover:bg-white', 'dark:hover:bg-nexus-hover'],

  // ── Standalone slate text → tokens ──────────────────
  ['text-slate-800 dark:text-slate-200', 'text-nexus-heading'],
  ['text-slate-800', 'text-nexus-heading'],
  ['text-slate-900', 'text-nexus-heading'],
  ['text-slate-600', 'text-nexus-muted'],
  ['text-slate-500', 'text-nexus-muted'],
  ['text-slate-300 dark:text-slate-500', 'text-nexus-muted'],
  ['text-slate-300', 'text-nexus-muted'],

  // ── Gold ratings / loyalty tiers ────────────────────
  ['text-yellow-400', 'text-nexus-gold'],
  ['text-yellow-500', 'text-nexus-gold'],
  ['fill-yellow-400', 'fill-nexus-gold'],
  ['bg-yellow-400', 'bg-nexus-gold'],

  // ── Wave 3: orange shades → primary tints ───────────
  ['text-orange-700/80 dark:text-orange-300/80', 'text-nexus-primary/80'],
  ['text-orange-800/80 dark:text-nexus-primary/80', 'text-nexus-primary/80'],
  ['text-orange-800/80 dark:text-orange-300/80', 'text-nexus-primary/80'],
  ['text-orange-900 dark:text-orange-300', 'text-nexus-primary'],
  ['text-orange-900 dark:text-nexus-primary', 'text-nexus-primary'],
  ['text-orange-800 dark:text-nexus-primary', 'text-nexus-primary'],
  ['text-orange-800 dark:text-orange-300', 'text-nexus-primary'],
  ['text-orange-700 dark:text-nexus-primary', 'text-nexus-primary'],
  ['hover:text-orange-700', 'hover:text-nexus-primary'],
  ['text-orange-700', 'text-nexus-primary'],
  ['text-orange-800', 'text-nexus-primary'],
  ['text-orange-900', 'text-nexus-primary'],
  ['text-orange-300/80', 'text-nexus-primary/80'],
  ['text-orange-300', 'text-nexus-primary'],
  ['dark:bg-orange-900/30', 'dark:bg-nexus-primary/30'],
  ['border-orange-100 dark:border-nexus-primary/20', 'border-nexus-primary/15 dark:border-nexus-primary/20'],
  ['border-orange-200 dark:border-nexus-primary/20', 'border-nexus-primary/20'],
  ['border-orange-200 dark:border-nexus-primary/30', 'border-nexus-primary/20 dark:border-nexus-primary/30'],
  ['border-orange-100', 'border-nexus-primary/15'],
  ['border-orange-200', 'border-nexus-primary/20'],
  ['hover:border-orange-300', 'hover:border-nexus-primary/30'],
  ['disabled:bg-orange-300', 'disabled:bg-nexus-primary/30'],

  // ── Wave 4: repair refactor artifacts + leftovers ──
  // `surface0` typo came from `bg-slate-500/xx` (mid-gray chip → muted)
  ['dark:bg-nexus-surface0/20', 'dark:bg-nexus-muted/20'],
  ['dark:bg-nexus-surface0/15', 'dark:bg-nexus-muted/15'],
  ['dark:bg-nexus-surface0/10', 'dark:bg-nexus-muted/10'],
  ['bg-nexus-surface0/20', 'bg-nexus-muted/20'],
  ['bg-nexus-surface0/15', 'bg-nexus-muted/15'],
  ['bg-nexus-surface0/10', 'bg-nexus-muted/10'],
  ['bg-nexus-surface0', 'bg-nexus-muted'],
  ['dark:border-slate-500/20', 'dark:border-nexus-border/20'],
  ['border-slate-500/20', 'border-nexus-border/20'],
  ['border-gray-500/20', 'border-nexus-border/20'],
  // Pre-existing invalid `nexus-blue` (CTA) + `nexus-dark` (navy panel) tokens
  ['bg-nexus-blue hover:bg-blue-600', 'bg-nexus-primary hover:bg-nexus-primary-hover'],
  ['bg-nexus-blue', 'bg-nexus-primary'],
  ['hover:bg-blue-600', 'hover:bg-nexus-primary-hover'],
  ['text-nexus-blue', 'text-nexus-info'],
  ['bg-nexus-dark/50', 'bg-nexus-dark-navy/50'],
  // NOTE: exact-token fix — must run AFTER `bg-nexus-dark/50`, and must NOT match
  // inside `bg-nexus-dark-navy` (a full token). Use negative-lookahead via suffix:
  ['bg-nexus-dark"', 'bg-nexus-dark-navy"'],
  ['bg-nexus-dark ', 'bg-nexus-dark-navy '],
  ['bg-nexus-dark/', 'bg-nexus-dark-navy/'],
  ['bg-nexus-dark}', 'bg-nexus-dark-navy}'],
  // Borders
  ['dark:border-gray-700', 'dark:border-nexus-border'],
  ['border-gray-100 dark:border-nexus-border', 'border-nexus-border'],
  ['dark:border-slate-900', 'dark:border-nexus-bg'],
  // Slate 700 status badges → heading (light) on surface
  ['bg-nexus-surface text-slate-700 dark:bg-nexus-card dark:text-slate-200', 'bg-nexus-surface text-nexus-heading dark:bg-nexus-card dark:text-nexus-text'],
  ['bg-nexus-surface text-slate-700 dark:bg-white/10 dark:text-nexus-textSecondary', 'bg-nexus-surface text-nexus-heading dark:bg-white/10 dark:text-nexus-textSecondary'],
  ['bg-nexus-surface text-slate-700 dark:bg-nexus-card dark:text-nexus-textSecondary', 'bg-nexus-surface text-nexus-heading dark:bg-nexus-card dark:text-nexus-textSecondary'],
  ['text-slate-700', 'text-nexus-heading'],
  // Hover states
  ['hover:border-slate-600', 'hover:border-nexus-border'],
  ['dark:hover:bg-slate-600', 'dark:hover:bg-nexus-hover'],
  ['dark:hover:bg-slate-700', 'dark:hover:bg-nexus-hover'],
  ['hover:text-slate-700 dark:hover:text-white', 'hover:text-nexus-heading dark:hover:text-white'],
  ['hover:text-slate-700 dark:hover:text-nexus-textSecondary', 'hover:text-nexus-heading dark:hover:text-nexus-textSecondary'],
  ['hover:text-slate-700', 'hover:text-nexus-heading'],
  // Toggle tracks (off state) + breadcrumb separators
  ['bg-slate-700', 'bg-nexus-muted'],
  ['dark:text-slate-700', 'dark:text-nexus-muted'],
  // Always-dark hero/panel text (was gray-300 on dark bg)
  ['text-gray-300', 'text-white/80'],
  // Chat bubble text (light bubble had invisible gray-200 text)
  ['bg-white dark:bg-nexus-bg text-gray-200', 'bg-white dark:bg-nexus-bg text-nexus-heading'],
  // Gold badge on product card
  ['bg-accent text-gray-900', 'bg-accent text-nexus-navy'],

  // ── Wave 5: semantic status colors → brand tokens ──
  // Amber = gold (warning), Rose/Red = error, Emerald = success, Blue = info
  ['bg-amber-100 text-amber-700 dark:bg-nexus-gold/20 dark:text-amber-400', 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold'],
  ['bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/30', 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold dark:hover:bg-nexus-gold/30 border border-nexus-gold/20 dark:border-nexus-gold/30'],
  ['bg-amber-100 text-amber-700', 'bg-nexus-gold/10 text-nexus-gold'],
  ['text-amber-700 dark:text-amber-400', 'text-nexus-gold'],
  ['text-amber-600 dark:text-amber-300', 'text-nexus-gold'],
  ['text-amber-800 dark:text-amber-300', 'text-nexus-gold'],
  ['text-amber-700 dark:text-amber-300', 'text-nexus-gold'],
  ['text-amber-600', 'text-nexus-gold'],
  ['text-amber-700', 'text-nexus-gold'],
  ['text-amber-800', 'text-nexus-gold'],
  ['text-amber-400', 'text-nexus-gold'],
  ['border-amber-200 dark:border-nexus-gold/20', 'border-nexus-gold/20'],
  ['border-amber-200', 'border-nexus-gold/20'],
  ['bg-amber-900/20 dark:text-amber-400', 'bg-nexus-gold/20 dark:text-nexus-gold'],
  // Rose → error
  ['bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400', 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error'],
  ['bg-rose-50 dark:bg-rose-500/10', 'bg-nexus-error/5 dark:bg-nexus-error/10'],
  ['bg-rose-500/20 text-rose-500', 'bg-nexus-error/20 text-nexus-error'],
  ['text-rose-600 dark:text-rose-400', 'text-nexus-error'],
  ['text-rose-700 dark:text-rose-400', 'text-nexus-error'],
  ['text-rose-500', 'text-nexus-error'],
  ['text-rose-400/60', 'text-nexus-error/60'],
  ['text-rose-600', 'text-nexus-error'],
  ['text-rose-700', 'text-nexus-error'],
  ['border-l-rose-500', 'border-l-nexus-error'],
  ['hover:bg-rose-200 dark:hover:bg-rose-500/30', 'hover:bg-nexus-error/10 dark:hover:bg-nexus-error/30'],
  ['bg-rose-200 dark:bg-rose-500/30', 'bg-nexus-error/10 dark:bg-nexus-error/30'],
  ['bg-rose-100 dark:bg-rose-500/20', 'bg-nexus-error/10 dark:bg-nexus-error/20'],
  ['bg-rose-100', 'bg-nexus-error/10'],
  ['bg-rose-500', 'bg-nexus-error'],
  // Yellow → gold
  ['bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-nexus-gold', 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold'],
  ['bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-nexus-gold', 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold'],
  ['bg-yellow-100 text-yellow-700', 'bg-nexus-gold/10 text-nexus-gold'],
  ['bg-yellow-100', 'bg-nexus-gold/10'],
  ['text-yellow-700', 'text-nexus-gold'],
  // Red → error
  ['text-red-600 dark:text-red-400', 'text-nexus-error'],
  ['text-red-600', 'text-nexus-error'],
  ['text-red-400', 'text-nexus-error'],
  ['bg-red-500/10 hover:bg-red-500/20 text-red-400', 'bg-nexus-error/10 hover:bg-nexus-error/20 text-nexus-error'],
  // Emerald → success
  ['text-emerald-600', 'text-nexus-success'],
  ['text-emerald-700', 'text-nexus-success'],
  ['bg-emerald-100 text-emerald-700', 'bg-nexus-success/10 text-nexus-success'],
  ['border-emerald-500', 'border-nexus-success'],
  // Blue → info
  ['text-blue-600 dark:text-blue-400', 'text-nexus-info'],
  ['text-blue-600', 'text-nexus-info'],
  ['text-blue-400', 'text-nexus-info'],

  // ── Wave 6: comprehensive semantic status colors ────
  // All red→error, blue→info, emerald/green→success, amber/yellow→gold
  // (longest patterns first to avoid partial corruption)
  ['bg-emerald-100 text-nexus-success dark:bg-emerald-500/20 dark:text-emerald-400', 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success'],
  ['bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success'],
  ['bg-emerald-100 text-emerald-700', 'bg-nexus-success/10 text-nexus-success'],
  ['bg-emerald-100 hover:bg-emerald-200 text-nexus-success dark:bg-emerald-500/20 dark:hover:bg-emerald-500/40 dark:text-emerald-400', 'bg-nexus-success/10 hover:bg-nexus-success/20 text-nexus-success dark:bg-nexus-success/20 dark:hover:bg-nexus-success/40 dark:text-nexus-success'],
  ['bg-emerald-100 dark:bg-emerald-500/15', 'bg-nexus-success/10 dark:bg-nexus-success/15'],
  ['bg-emerald-100 dark:bg-emerald-500/20', 'bg-nexus-success/10 dark:bg-nexus-success/20'],
  ['bg-emerald-100', 'bg-nexus-success/10'],
  ['bg-emerald-50 dark:bg-emerald-500/10', 'bg-nexus-success/10 dark:bg-nexus-success/10'],
  ['bg-emerald-50 dark:bg-emerald-500/15', 'bg-nexus-success/10 dark:bg-nexus-success/15'],
  ['bg-emerald-50', 'bg-nexus-success/10'],
  ['bg-emerald-500/10', 'bg-nexus-success/10'],
  ['bg-emerald-500/15', 'bg-nexus-success/15'],
  ['bg-emerald-500/20', 'bg-nexus-success/20'],
  ['bg-emerald-500 hover:bg-emerald-600', 'bg-nexus-success hover:bg-nexus-success'],
  ['bg-emerald-500', 'bg-nexus-success'],
  ['hover:bg-emerald-100', 'hover:bg-nexus-success/20'],
  ['hover:bg-emerald-50 dark:hover:bg-emerald-500/10', 'hover:bg-nexus-success/10 dark:hover:bg-nexus-success/10'],
  ['dark:hover:bg-emerald-500/10', 'dark:hover:bg-nexus-success/10'],
  ['text-emerald-500', 'text-nexus-success'],
  ['text-emerald-400', 'text-nexus-success'],
  ['text-emerald-700', 'text-nexus-success'],
  ['dark:text-emerald-400', 'dark:text-nexus-success'],
  ['bg-green-500', 'bg-nexus-success'],
  // Red → error
  ['bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-nexus-error', 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error'],
  ['bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-nexus-error', 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/30 dark:text-nexus-error'],
  ['bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-500/20 dark:hover:bg-red-500/40 dark:text-nexus-error', 'bg-nexus-error/10 hover:bg-nexus-error/20 text-nexus-error dark:bg-nexus-error/20 dark:hover:bg-nexus-error/40 dark:text-nexus-error'],
  ['bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-500/20 dark:hover:bg-red-500/40 dark:text-red-400', 'bg-nexus-error/10 hover:bg-nexus-error/20 text-nexus-error dark:bg-nexus-error/20 dark:hover:bg-nexus-error/40 dark:text-nexus-error'],
  ['bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-nexus-error dark:border-red-500/20', 'bg-nexus-error/5 text-nexus-error border-nexus-error/20 dark:bg-nexus-error/10 dark:text-nexus-error dark:border-nexus-error/20'],
  ['bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:hover:bg-red-500/30', 'bg-nexus-error/5 text-nexus-error hover:bg-nexus-error/10 dark:bg-nexus-error/20 dark:hover:bg-nexus-error/30'],
  ['bg-red-50 text-red-500', 'bg-nexus-error/5 text-nexus-error'],
  ['bg-red-50 dark:bg-red-900/20', 'bg-nexus-error/5 dark:bg-nexus-error/20'],
  ['bg-red-50 dark:bg-red-500/10', 'bg-nexus-error/5 dark:bg-nexus-error/10'],
  ['bg-red-50 dark:bg-red-500/15', 'bg-nexus-error/5 dark:bg-nexus-error/15'],
  ['bg-red-50', 'bg-nexus-error/5'],
  ['bg-red-100', 'bg-nexus-error/10'],
  ['bg-red-500/10', 'bg-nexus-error/10'],
  ['bg-red-500/15', 'bg-nexus-error/15'],
  ['bg-red-500/20', 'bg-nexus-error/20'],
  ['bg-red-500', 'bg-nexus-error'],
  ['bg-red-900/20', 'bg-nexus-error/20'],
  ['bg-red-900/30', 'bg-nexus-error/30'],
  ['hover:bg-red-100', 'hover:bg-nexus-error/10'],
  ['hover:bg-red-50 dark:hover:bg-red-500/10', 'hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10'],
  ['hover:bg-red-50 dark:hover:bg-red-500/20', 'hover:bg-nexus-error/5 dark:hover:bg-nexus-error/20'],
  ['hover:bg-red-50', 'hover:bg-nexus-error/5'],
  ['dark:hover:bg-red-500/10', 'dark:hover:bg-nexus-error/10'],
  ['dark:hover:bg-red-500/20', 'dark:hover:bg-nexus-error/20'],
  ['dark:bg-red-500/10', 'dark:bg-nexus-error/10'],
  ['dark:bg-red-500/15', 'dark:bg-nexus-error/15'],
  ['dark:bg-red-500/20', 'dark:bg-nexus-error/20'],
  ['dark:bg-red-900/20', 'dark:bg-nexus-error/20'],
  ['dark:bg-red-900/30', 'dark:bg-nexus-error/30'],
  ['hover:text-red-500', 'hover:text-nexus-error'],
  ['hover:text-red-700', 'hover:text-nexus-error'],
  ['text-red-500', 'text-nexus-error'],
  ['text-red-400', 'text-nexus-error'],
  ['text-red-600', 'text-nexus-error'],
  ['text-red-700', 'text-nexus-error'],
  ['group-hover:bg-red-500', 'group-hover:bg-nexus-error'],
  ['group-hover:text-red-500', 'group-hover:text-nexus-error'],
  ['border-red-200', 'border-nexus-error/20'],
  ['dark:border-red-500/20', 'dark:border-nexus-error/20'],
  ['border-red-300', 'border-nexus-error/30'],
  // Blue → info
  ['bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-nexus-info', 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info'],
  ['bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-nexus-info', 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/30 dark:text-nexus-info'],
  ['bg-blue-100 text-blue-700', 'bg-nexus-info/10 text-nexus-info'],
  ['bg-blue-100', 'bg-nexus-info/10'],
  ['bg-blue-50 dark:bg-blue-500/10', 'bg-nexus-info/10 dark:bg-nexus-info/10'],
  ['bg-blue-50 dark:bg-blue-500/15', 'bg-nexus-info/10 dark:bg-nexus-info/15'],
  ['bg-blue-50 dark:bg-blue-900/20', 'bg-nexus-info/10 dark:bg-nexus-info/20'],
  ['bg-blue-50', 'bg-nexus-info/10'],
  ['bg-blue-500/10', 'bg-nexus-info/10'],
  ['bg-blue-500/15', 'bg-nexus-info/15'],
  ['bg-blue-500/20', 'bg-nexus-info/20'],
  ['bg-blue-500 group-hover:bg-blue-500', 'bg-nexus-info group-hover:bg-nexus-info'],
  ['bg-blue-500', 'bg-nexus-info'],
  ['hover:bg-blue-50 dark:hover:bg-blue-500/10', 'hover:bg-nexus-info/10 dark:hover:bg-nexus-info/10'],
  ['hover:bg-blue-50', 'hover:bg-nexus-info/10'],
  ['dark:hover:bg-blue-500/10', 'dark:hover:bg-nexus-info/10'],
  ['dark:bg-blue-500/10', 'dark:bg-nexus-info/10'],
  ['dark:bg-blue-500/15', 'dark:bg-nexus-info/15'],
  ['dark:bg-blue-500/20', 'dark:bg-nexus-info/20'],
  ['dark:bg-blue-900/20', 'dark:bg-nexus-info/20'],
  ['dark:bg-blue-900/30', 'dark:bg-nexus-info/30'],
  ['text-blue-800 dark:text-blue-300', 'text-nexus-info'],
  ['text-blue-700 dark:text-nexus-info', 'text-nexus-info'],
  ['text-blue-700', 'text-nexus-info'],
  ['text-blue-500', 'text-nexus-info'],
  ['text-blue-400', 'text-nexus-info'],
  ['dark:text-blue-500', 'dark:text-nexus-info'],
  ['dark:text-blue-400', 'dark:text-nexus-info'],
  ['dark:text-blue-300', 'dark:text-nexus-info'],
  ['hover:text-blue-500', 'hover:text-nexus-info'],
  ['group-hover:bg-blue-500', 'group-hover:bg-nexus-info'],
  ['group-hover:text-blue-500', 'group-hover:text-nexus-info'],
  ['border-blue-200 dark:border-blue-500/20', 'border-nexus-info/20'],
  ['border-blue-200', 'border-nexus-info/20'],
  ['dark:border-blue-500/20', 'dark:border-nexus-info/20'],
  // Amber/yellow remnants → gold
  ['bg-amber-100 dark:bg-nexus-gold/15', 'bg-nexus-gold/10 dark:bg-nexus-gold/15'],
  ['bg-amber-100 dark:bg-nexus-gold/20', 'bg-nexus-gold/10 dark:bg-nexus-gold/20'],
  ['bg-amber-100 dark:bg-amber-900/30', 'bg-nexus-gold/10 dark:bg-nexus-gold/30'],
  ['bg-amber-100', 'bg-nexus-gold/10'],
  ['bg-amber-900/20', 'bg-nexus-gold/20'],
  ['bg-amber-900/30', 'bg-nexus-gold/30'],
  ['hover:bg-amber-100', 'hover:bg-nexus-gold/10'],
  ['dark:bg-amber-900/20', 'dark:bg-nexus-gold/20'],
  ['dark:bg-amber-900/30', 'dark:bg-nexus-gold/30'],
  ['dark:hover:bg-amber-900/40', 'dark:hover:bg-nexus-gold/30'],
  ['border-amber-200', 'border-nexus-gold/20'],
  ['dark:border-amber-800/30', 'dark:border-nexus-gold/30'],
  ['bg-yellow-500/10', 'bg-nexus-gold/10'],
  ['bg-yellow-500/20', 'bg-nexus-gold/20'],
  ['bg-yellow-500', 'bg-nexus-gold'],
  ['text-yellow-700', 'text-nexus-gold'],
  ['text-amber-800 dark:text-amber-300', 'text-nexus-gold'],
  ['text-amber-700 dark:text-amber-300', 'text-nexus-gold'],
  ['text-amber-700', 'text-nexus-gold'],
  ['text-amber-600', 'text-nexus-gold'],
  ['text-amber-400', 'text-nexus-gold'],

  // ── Wave 3: gray → tokens ───────────────────────────
  ['text-gray-700 dark:text-gray-300', 'text-nexus-text'],
  ['text-gray-600 dark:text-gray-300', 'text-nexus-muted'],
  ['text-gray-600 dark:text-nexus-muted', 'text-nexus-muted'],
  ['text-gray-500 dark:text-gray-400', 'text-nexus-muted'],
  ['text-gray-700 dark:text-gray-200', 'text-nexus-text'],
  ['dark:text-gray-400', 'dark:text-nexus-muted'],
  ['dark:text-gray-500', 'dark:text-nexus-muted'],
  ['text-gray-700', 'text-nexus-text'],
  ['text-gray-600', 'text-nexus-muted'],
  ['border-gray-300 dark:border-gray-600', 'border-nexus-border'],
  ['border-gray-300', 'border-nexus-border'],
  ['border-gray-200 dark:border-gray-700', 'border-nexus-border'],
  ['border-gray-200', 'border-nexus-border'],
  ['bg-gray-100 dark:bg-gray-800', 'bg-nexus-surface dark:bg-nexus-card'],
  ['bg-gray-100', 'bg-nexus-surface'],
  ['bg-gray-200 dark:bg-gray-700', 'bg-nexus-surface dark:bg-nexus-card'],
  ['bg-gray-200', 'bg-nexus-surface'],
  ['dark:bg-gray-800', 'dark:bg-nexus-card'],
  ['dark:bg-gray-700', 'dark:bg-nexus-card'],
  ['dark:bg-gray-900', 'dark:bg-nexus-bg'],
  ['hover:bg-gray-100 dark:hover:bg-gray-800', 'hover:bg-nexus-surface dark:hover:bg-nexus-hover'],
  ['hover:bg-gray-50 dark:hover:bg-gray-800', 'hover:bg-nexus-surface dark:hover:bg-nexus-hover'],
  ['hover:bg-gray-100', 'hover:bg-nexus-surface'],
  ['hover:bg-gray-50', 'hover:bg-nexus-surface'],
  ['bg-gray-50', 'bg-nexus-surface'],
  ['bg-gray-50 dark:bg-gray-800', 'bg-nexus-surface dark:bg-nexus-card'],

  // ══ Wave 8 (runs LAST): repair double-opacity artifacts + mopped-up leftovers ══
  // Substring collisions (e.g. `bg-blue-50` matching inside `bg-blue-500/10`)
  // produced `bg-nexus-info/100/10` etc. Collapse them here, longest-first.
  ['dark:hover:bg-nexus-info/100/15', 'dark:hover:bg-nexus-info/15'],
  ['dark:hover:bg-nexus-info/100/10', 'dark:hover:bg-nexus-info/10'],
  ['dark:bg-nexus-info/100/15', 'dark:bg-nexus-info/15'],
  ['dark:bg-nexus-info/100/10', 'dark:bg-nexus-info/10'],
  ['bg-nexus-info/100/15', 'bg-nexus-info/15'],
  ['bg-nexus-info/100/10', 'bg-nexus-info/10'],
  ['bg-nexus-info/100', 'bg-nexus-info'],
  ['dark:bg-nexus-success/100/30', 'dark:bg-nexus-success/30'],
  ['dark:bg-nexus-success/100/20', 'dark:bg-nexus-success/20'],
  ['dark:bg-nexus-success/100/10', 'dark:bg-nexus-success/10'],
  ['dark:hover:bg-nexus-success/100/30', 'dark:hover:bg-nexus-success/30'],
  ['bg-nexus-success/100/30', 'bg-nexus-success/30'],
  ['bg-nexus-success/100/20', 'bg-nexus-success/20'],
  ['bg-nexus-success/100/10', 'bg-nexus-success/10'],
  ['bg-nexus-success/100', 'bg-nexus-success'],
  ['bg-nexus-error/50/30', 'bg-nexus-error/30'],
  ['bg-nexus-error/50/20', 'bg-nexus-error/20'],
  ['bg-nexus-error/50/10', 'bg-nexus-error/10'],
  ['bg-nexus-error/50', 'bg-nexus-error'],
  ['bg-nexus-gold/50/20', 'bg-nexus-gold/20'],
  ['bg-nexus-gold/50/10', 'bg-nexus-gold/10'],
  ['bg-nexus-gold/50', 'bg-nexus-gold'],
  // `-navy-navy` from greedy navy rule
  ['bg-nexus-dark-navy-navy/50', 'bg-nexus-dark-navy/50'],
  ['bg-nexus-dark-navy-navy', 'bg-nexus-dark-navy'],
  // Invalid `nexus-blue` remnants in focus/inputs
  ['focus:border-nexus-blue', 'focus:border-nexus-info'],
  ['focus:bg-nexus-blue', 'focus:bg-nexus-info'],
  ['text-nexus-blue', 'text-nexus-info'],
  ['bg-nexus-blue', 'bg-nexus-primary'],
  // Remaining blue → info
  ['dark:border-blue-800', 'dark:border-nexus-info/80'],
  ['dark:border-blue-900/10', 'dark:border-nexus-info/10'],
  ['dark:bg-blue-900/40', 'dark:bg-nexus-info/40'],
  ['dark:bg-blue-900/10', 'dark:bg-nexus-info/10'],
  ['dark:hover:bg-blue-900/50', 'dark:hover:bg-nexus-info/50'],
  ['dark:hover:bg-blue-500/20', 'dark:hover:bg-nexus-info/20'],
  ['hover:bg-blue-200', 'hover:bg-nexus-info/20'],
  ['hover:border-blue-500', 'hover:border-nexus-info'],
  ['border-blue-500/20', 'border-nexus-info/20'],
  ['border-blue-500', 'border-nexus-info'],
  ['text-blue-300', 'text-nexus-info'],
  ['text-blue-800 dark:text-blue-300', 'text-nexus-info'],
  ['bg-blue-500/10', 'bg-nexus-info/10'],
  ['bg-blue-500', 'bg-nexus-info'],
  ['text-blue-500', 'text-nexus-info'],
  ['text-blue-700', 'text-nexus-info'],
  // Remaining green → success
  ['bg-green-100 text-green-700 dark:bg-nexus-success/20 dark:text-green-400', 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success'],
  ['bg-green-100 text-green-700', 'bg-nexus-success/10 text-nexus-success'],
  ['bg-green-50 text-green-700 border-green-200 dark:bg-nexus-success/10 dark:text-green-400 dark:border-green-500/20', 'bg-nexus-success/5 text-nexus-success border-nexus-success/20 dark:bg-nexus-success/10 dark:text-nexus-success dark:border-nexus-success/20'],
  ['bg-green-50 text-green-600 hover:bg-green-100 dark:bg-nexus-success/10 dark:text-green-400 dark:hover:bg-nexus-success/20', 'bg-nexus-success/5 text-nexus-success hover:bg-nexus-success/10 dark:bg-nexus-success/10 dark:text-nexus-success dark:hover:bg-nexus-success/20'],
  ['bg-green-50 text-green-500', 'bg-nexus-success/5 text-nexus-success'],
  ['bg-green-50 dark:bg-green-900/20', 'bg-nexus-success/5 dark:bg-nexus-success/20'],
  ['bg-green-50 dark:hover:bg-green-900/40', 'bg-nexus-success/5 dark:hover:bg-nexus-success/40'],
  ['bg-green-50', 'bg-nexus-success/5'],
  ['bg-green-100 dark:bg-nexus-success/20', 'bg-nexus-success/10 dark:bg-nexus-success/20'],
  ['bg-green-100', 'bg-nexus-success/10'],
  ['bg-green-600 dark:bg-green-400', 'bg-nexus-success'],
  ['bg-green-600', 'bg-nexus-success'],
  ['bg-green-500', 'bg-nexus-success'],
  ['bg-green-400', 'bg-nexus-success'],
  ['bg-green-900/20', 'bg-nexus-success/20'],
  ['dark:bg-green-900/40', 'dark:bg-nexus-success/40'],
  ['dark:bg-green-900/20', 'dark:bg-nexus-success/20'],
  ['dark:bg-green-500/10', 'dark:bg-nexus-success/10'],
  ['hover:bg-green-100', 'hover:bg-nexus-success/10'],
  ['hover:bg-green-600', 'hover:bg-nexus-success'],
  ['hover:bg-green-50 dark:hover:bg-nexus-success/10', 'hover:bg-nexus-success/5 dark:hover:bg-nexus-success/10'],
  ['group-hover:bg-green-500', 'group-hover:bg-nexus-success'],
  ['group-hover:text-green-500', 'group-hover:text-nexus-success'],
  ['hover:border-green-500', 'hover:border-nexus-success'],
  ['dark:hover:border-green-500/30', 'dark:hover:border-nexus-success/30'],
  ['border-green-200', 'border-nexus-success/20'],
  ['border-green-500/40', 'border-nexus-success/40'],
  ['border-green-500/20', 'border-nexus-success/20'],
  ['border-green-500', 'border-nexus-success'],
  ['border-green-100', 'border-nexus-success/10'],
  ['dark:border-green-800/30', 'dark:border-nexus-success/30'],
  ['text-green-700 dark:text-green-400', 'text-nexus-success'],
  ['text-green-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-nexus-success/10', 'text-nexus-success hover:text-nexus-success hover:bg-nexus-success/5 dark:hover:bg-nexus-success/10'],
  ['text-green-700', 'text-nexus-success'],
  ['text-green-600', 'text-nexus-success'],
  ['text-green-500', 'text-nexus-success'],
  ['text-green-400', 'text-nexus-success'],
  ['text-green-300', 'text-nexus-success'],
  ['dark:text-green-400', 'dark:text-nexus-success'],
  ['hover:text-green-500', 'hover:text-nexus-success'],
  // Remaining emerald → success
  ['dark:bg-emerald-900/30', 'dark:bg-nexus-success/30'],
  ['dark:hover:bg-emerald-900/50', 'dark:hover:bg-nexus-success/50'],
  ['dark:border-emerald-800', 'dark:border-nexus-success/80'],
  ['dark:border-emerald-500/20', 'dark:border-nexus-success/20'],
  ['hover:bg-emerald-200', 'hover:bg-nexus-success/20'],
  ['hover:bg-emerald-600', 'hover:bg-nexus-success'],
  ['bg-emerald-300', 'bg-nexus-success'],
  ['bg-emerald-100', 'bg-nexus-success/10'],
  ['bg-emerald-500/20', 'bg-nexus-success/20'],
  ['bg-emerald-500', 'bg-nexus-success'],
  ['text-emerald-300', 'text-nexus-success'],
  ['text-emerald-100', 'text-nexus-success'],
  ['text-emerald-500', 'text-nexus-success'],
  ['dark:text-emerald-300', 'dark:text-nexus-success'],
  ['dark:text-emerald-400', 'dark:text-nexus-success'],
  ['border-emerald-200', 'border-nexus-success/20'],
  // Remaining rose/red → error
  ['bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400', 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error'],
  ['bg-rose-50 dark:bg-rose-500/10', 'bg-nexus-error/5 dark:bg-nexus-error/10'],
  ['hover:bg-rose-200 dark:hover:bg-rose-500/30', 'hover:bg-nexus-error/10 dark:hover:bg-nexus-error/30'],
  ['border-l-rose-500', 'border-l-nexus-error'],
  ['text-rose-600 dark:text-rose-400', 'text-nexus-error'],
  ['text-rose-700 dark:text-rose-400', 'text-nexus-error'],
  ['text-rose-600', 'text-nexus-error'],
  ['text-rose-700', 'text-nexus-error'],
  ['text-rose-500', 'text-nexus-error'],
  ['text-rose-400/60', 'text-nexus-error/60'],
  ['text-rose-400', 'text-nexus-error'],
  ['bg-rose-600', 'bg-nexus-error'],
  ['bg-rose-100', 'bg-nexus-error/10'],
  ['bg-rose-500/20', 'bg-nexus-error/20'],
  ['bg-rose-500', 'bg-nexus-error'],
  ['bg-red-600', 'bg-nexus-error'],
  ['hover:bg-red-200 dark:hover:bg-red-500/40', 'hover:bg-nexus-error/20 dark:hover:bg-nexus-error/40'],
  ['dark:border-red-800/30', 'dark:border-nexus-error/30'],
  ['dark:hover:bg-red-900/40', 'dark:hover:bg-nexus-error/40'],
  ['hover:border-red-500', 'hover:border-nexus-error'],
  ['border-red-500', 'border-nexus-error'],
  ['border-red-200', 'border-nexus-error/20'],
  ['dark:border-red-500/20', 'dark:border-nexus-error/20'],
  ['dark:border-red-900/50', 'dark:border-nexus-error/50'],
  ['dark:bg-red-900/30', 'dark:bg-nexus-error/30'],
  ['dark:bg-red-900/20', 'dark:bg-nexus-error/20'],
  ['dark:bg-red-500/20', 'dark:bg-nexus-error/20'],
  ['dark:bg-red-500/10', 'dark:bg-red-500/10'],
  ['dark:hover:bg-red-500/10', 'dark:hover:bg-red-500/10'],
  ['hover:bg-red-100', 'hover:bg-nexus-error/10'],
  ['hover:bg-red-50 dark:hover:bg-red-500/10', 'hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10'],
  ['hover:bg-red-50', 'hover:bg-nexus-error/5'],
  ['text-red-700 dark:text-red-400', 'text-nexus-error'],
  ['text-red-600 dark:text-red-400', 'text-nexus-error'],
  ['text-red-700', 'text-nexus-error'],
  ['text-red-600', 'text-nexus-error'],
  ['text-red-500', 'text-nexus-error'],
  ['text-red-400', 'text-nexus-error'],
  ['text-red-300', 'text-nexus-error'],
  ['dark:text-red-300', 'dark:text-nexus-error'],
  // Remaining amber → gold
  ['bg-amber-100 dark:bg-nexus-gold/15', 'bg-nexus-gold/10 dark:bg-nexus-gold/15'],
  ['bg-amber-100 dark:bg-amber-900/30', 'bg-nexus-gold/10 dark:bg-nexus-gold/30'],
  ['bg-amber-100', 'bg-nexus-gold/10'],
  ['dark:bg-amber-900/30', 'dark:bg-nexus-gold/30'],
  ['dark:bg-amber-900/20', 'dark:bg-nexus-gold/20'],
  ['dark:hover:bg-amber-900/40', 'dark:hover:bg-nexus-gold/30'],
  ['hover:bg-amber-100', 'hover:bg-nexus-gold/10'],
  ['border-amber-200 dark:border-amber-800/30', 'border-nexus-gold/20 dark:border-nexus-gold/30'],
  ['border-amber-200', 'border-nexus-gold/20'],
  ['border-amber-400', 'border-nexus-gold/40'],
  ['border-amber-300', 'border-nexus-gold/30'],
  ['dark:border-amber-800', 'dark:border-nexus-gold/80'],
  ['text-amber-800 dark:text-amber-300', 'text-nexus-gold'],
  ['text-amber-700 dark:text-amber-300', 'text-nexus-gold'],
  ['text-amber-700 dark:text-amber-400', 'text-nexus-gold'],
  ['text-amber-600', 'text-nexus-gold'],
  ['text-amber-500', 'text-nexus-gold'],
  ['text-amber-400', 'text-nexus-gold'],
  ['text-amber-300', 'text-nexus-gold'],
  ['dark:text-amber-400', 'dark:text-nexus-gold'],
  ['dark:text-amber-300', 'dark:text-nexus-gold'],
  ['bg-amber-600', 'bg-nexus-gold'],
  ['bg-amber-500/20', 'bg-nexus-gold/20'],
  ['bg-amber-500', 'bg-nexus-gold'],
  // Yellow remnants → gold
  ['bg-yellow-100 text-yellow-700', 'bg-nexus-gold/10 text-nexus-gold'],
  ['bg-yellow-100', 'bg-nexus-gold/10'],
  ['text-yellow-700', 'text-nexus-gold'],
  ['text-yellow-400', 'text-nexus-gold'],
  ['bg-yellow-500/10', 'bg-nexus-gold/10'],
  ['bg-yellow-500', 'bg-nexus-gold'],
  ['dark:border-red-800', 'dark:border-nexus-error/80'],
  ['dark:hover:bg-green-900/40', 'dark:hover:bg-nexus-success/40'],
  ['border-red-100', 'border-nexus-error/10'],

  // ── Wave 9: final hardcoded-color mopping (table dividers, focus rings, hex arbitrary values) ──
  ['divide-slate-200 dark:divide-slate-700/50', 'divide-nexus-border dark:divide-nexus-card/50'],
  ['divide-slate-200 dark:divide-slate-700', 'divide-nexus-border dark:divide-nexus-card'],
  ['divide-slate-200 dark:divide-slate-800', 'divide-nexus-border dark:divide-nexus-card'],
  ['divide-slate-100 dark:divide-slate-800', 'divide-nexus-border dark:divide-nexus-card'],
  ['divide-slate-100', 'divide-nexus-border'],
  ['divide-slate-800', 'divide-nexus-card'],
  ['divide-slate-700/50', 'divide-nexus-card/50'],
  ['divide-slate-700', 'divide-nexus-card'],
  ['divide-slate-200', 'divide-nexus-border'],
  ['shadow-orange-500/40', 'shadow-primary/40'],
  ['shadow-orange-500/30', 'shadow-primary/30'],
  ['shadow-orange-200', 'shadow-primary/20'],
  ['ring-orange-500/20', 'ring-primary/20'],
  ['ring-orange-300', 'ring-primary'],
  ['ring-orange-800', 'ring-primary'],
  ['focus:ring-indigo-500/50', 'focus:ring-nexus-info/50'],
  ['focus:ring-indigo-500', 'focus:ring-nexus-info'],
  ['focus:ring-blue-500/50', 'focus:ring-nexus-info/50'],
  ['focus:ring-rose-500', 'focus:ring-nexus-error'],
  ['focus:ring-emerald-500/50', 'focus:ring-nexus-success/50'],
  ['focus:ring-emerald-500', 'focus:ring-nexus-success'],
  ['focus:ring-red-400/40', 'focus:ring-nexus-error/40'],
  ['placeholder-slate-500', 'placeholder-nexus-muted'],
  ['border-slate-200/50', 'border-nexus-border/50'],
  ['bg-[#111827]', 'bg-nexus-card'],
  ['to-[#111827]', 'to-nexus-card'],
  ['bg-[#1F2937]', 'bg-nexus-dark-navy'],
  ['bg-[#1E293B]', 'bg-nexus-dark-navy'],
  ['border-[#1E293B]', 'border-nexus-dark-navy'],
  ['from-[#1E293B]', 'from-nexus-dark-navy'],
  ['border-[#070B1A]', 'border-nexus-dark-navy'],
  ['border-[#0a0e1a]', 'border-nexus-dark-navy'],
  ['from-[#0F172A]', 'from-nexus-dark-navy'],
  ['via-[#0F172A]', 'via-nexus-dark-navy'],
  ['to-[#0F172A]', 'to-nexus-dark-navy'],
  ['from-[#1a0f0a]', 'from-nexus-dark-navy'],
  ['ring-offset-[#0a0e1a]', 'ring-offset-nexus-dark-navy'],
  ['bg-[#ff5a2e]', 'bg-nexus-primary-hover'],
  ['text-[#ff5a2e]', 'text-nexus-primary-hover'],
  ['to-[#FF8C42]', 'to-nexus-primary-hover'],
  ['to-[#FF724C]', 'to-nexus-primary'],
  ['to-orange-300', 'to-nexus-primary-hover'],
  ['to-orange-600', 'to-nexus-primary-hover'],
  ['to-orange-400', 'to-nexus-primary-hover'],
  ['from-orange-600', 'from-nexus-primary'],
  ['from-orange-50', 'from-nexus-primary/10'],
  ['to-[#34d399]', 'to-nexus-success'],
  ['hover:from-[#34d399]', 'hover:from-nexus-success'],
  ['to-[#047857]', 'to-nexus-success'],
  ['shadow-[#10b981]', 'shadow-nexus-success'],
  ['shadow-[#f59e0b]', 'shadow-nexus-gold'],
  ['ring-[#10b981]', 'ring-nexus-success'],
  ['ring-[#f59e0b]', 'ring-nexus-gold'],
  ['text-[#fbbf24]', 'text-nexus-gold'],
  ['hover:from-[#fbbf24]', 'hover:from-nexus-gold'],
  ['focus:border-[#f59e0b]', 'focus:border-nexus-gold'],
  ['focus:ring-[#f59e0b]', 'focus:ring-nexus-gold'],
  ['text-[#059669]', 'text-nexus-success'],

  // ══ Wave 10: generated secondary-palette → semantic tokens ══
  ...buildSecondaryRules(),
];

function buildSecondaryRules() {
  const rules = [];
  const push = (from, to) => rules.push([from, to]);
  const hueMap = {
    info: ['indigo', 'violet', 'purple', 'cyan', 'sky', 'blue'],
    success: ['teal', 'emerald', 'green'],
    error: ['pink', 'rose', 'red'],
  };
  for (const [token, hues] of Object.entries(hueMap)) {
    for (const h of hues) {
      ['400', '500', '600', '700'].forEach((n) => push(`text-${h}-${n}`, `text-${token}`));
      ['300', '400', '500'].forEach((n) => push(`dark:text-${h}-${n}`, `dark:text-${token}`));
      ['50', '100'].forEach((n) => push(`bg-${h}-${n}`, `bg-${token}/10`));
      ['500', '600', '700'].forEach((n) => push(`bg-${h}-${n}`, `bg-${token}`));
      ['10', '15', '20'].forEach((n) => push(`bg-${h}-500/${n}`, `bg-${token}/${n}`));
      ['10', '15', '20'].forEach((n) => push(`dark:bg-${h}-500/${n}`, `dark:bg-${token}/${n}`));
      push(`border-${h}-200`, `border-${token}/20`);
      push(`border-${h}-500/20`, `border-${token}/20`);
      push(`dark:border-${h}-500/20`, `dark:border-${token}/20`);
      push(`focus:border-${h}-500`, `focus:border-${token}`);
      push(`focus:ring-${h}-500`, `focus:ring-${token}`);
      push(`hover:text-${h}-600`, `hover:text-${token}`);
      push(`hover:text-${h}-700`, `hover:text-${token}`);
      push(`hover:bg-${h}-600`, `hover:bg-${token}`);
      push(`hover:bg-${h}-700`, `hover:bg-${token}`);
      ['10', '20', '30'].forEach((n) => push(`shadow-${h}-500/${n}`, `shadow-${token}/${n}`));
      push(`shadow-${h}-600/20`, `shadow-${token}/20`);
      ['400', '500', '600'].forEach((n) => push(`from-${h}-${n}`, `from-${token}`));
      ['400', '500'].forEach((n) => push(`via-${h}-${n}`, `via-${token}`));
      ['400', '500'].forEach((n) => push(`to-${h}-${n}`, `to-${token}`));
      push(`to-${h}-600`, `to-${token}`);
    }
  }
  // Amber (dispatch portal identity) keeps a warm gold/light-gold gradient
  push('from-amber-600', 'from-nexus-gold');
  push('via-amber-500', 'via-nexus-light-gold');
  push('to-amber-400', 'to-nexus-light-gold');
  push('to-amber-500', 'to-nexus-gold');
  // Gray → muted
  ['400', '500', '600'].forEach((n) => push(`text-gray-${n}`, 'text-nexus-muted'));
  ['400', '500', '600'].forEach((n) => push(`dark:text-gray-${n}`, 'dark:text-nexus-muted'));
  ['50', '100'].forEach((n) => push(`bg-gray-${n}`, 'bg-nexus-surface'));
  ['700', '800', '900'].forEach((n) => push(`bg-gray-${n}`, 'bg-nexus-surface'));
  ['700', '800', '900'].forEach((n) => push(`dark:bg-gray-${n}`, 'dark:bg-nexus-surface'));
  push('border-gray-200', 'border-nexus-border');
  push('placeholder-gray-600', 'placeholder-nexus-muted');
  // Slate → dark-navy (gradient overlays & shadows)
  push('from-slate-900', 'from-nexus-dark-navy');
  push('via-slate-800', 'via-nexus-navy');
  push('to-slate-900', 'to-nexus-dark-navy');
  ['20', '50'].forEach((n) => push(`shadow-slate-900/${n}`, `shadow-nexus-dark-navy/${n}`));
  return rules;
}

function collectFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(full));
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function replaceAll(str, from, to) {
  return str.split(from).join(to);
}

function main() {
  const files = collectFiles(SRC);
  const stats = { filesChanged: 0, replacements: 0 };
  const detail = new Map();

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    let content = original;
    let count = 0;

    for (const [from, to] of REPLACEMENTS) {
      if (content.includes(from)) {
        const occurrences = content.split(from).length - 1;
        content = replaceAll(content, from, to);
        count += occurrences;
      }
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      stats.filesChanged++;
      stats.replacements += count;
      detail.set(file, count);
    }
  }

  console.log(`Files changed: ${stats.filesChanged}`);
  console.log(`Total replacements: ${stats.replacements}`);
  for (const [file, count] of detail) {
    console.log(`  ${path.relative(ROOT, file)}  (+${count})`);
  }
}

main();
