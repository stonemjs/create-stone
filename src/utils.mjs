/**
 * Format target directory.
 *
 * @param   {string} value
 * @returns {string}
 */
export function formatTargetDir (value) {
  return value?.trim().replace(/\/+$/g, '')
}

/**
 * Normalize project name.
 *
 * @param   {string} value
 * @returns {string}
 */
export function toValidProjectName (value) {
  value = this.formatTargetDir(value)
  return value// value === '.' ? path.basename(path.resolve()) : value
}

/**
 * Normalize package name.
 *
 * @param   {string} value
 * @returns {string}
 */
export function toValidPackageName (value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/^[^a-z\d\-~]+/g, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

/**
 * Is package name valid.
 *
 * @param   {string} value
 * @returns {boolean}
 */
export function isValidPackageName (value) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(value)
}
