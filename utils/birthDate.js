/**
 * Valida fecha de nacimiento YYYY-MM-DD (solo fecha, UTC).
 * Edad mínima 10 años; año >= 1900; no futura.
 * @param {unknown} raw - string ISO fecha o null (limpiar)
 * @returns {{ ok: true, value: string | null } | { ok: false, error: string }}
 */
export function normalizeBirthDateInput(raw) {
    if (raw === null) {
        return { ok: true, value: null };
    }
    if (raw === undefined || raw === '') {
        return { ok: false, error: 'Fecha de nacimiento requerida' };
    }

    const s = String(raw).trim();
    if (!s) {
        return { ok: false, error: 'Fecha de nacimiento requerida' };
    }

    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
        return { ok: false, error: 'Fecha inválida (use YYYY-MM-DD)' };
    }

    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);

    if (y < 1900) {
        return { ok: false, error: 'Año de nacimiento no válido' };
    }

    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
        return { ok: false, error: 'Fecha no válida' };
    }

    const now = new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (dt.getTime() > todayUtc) {
        return { ok: false, error: 'La fecha de nacimiento no puede ser futura' };
    }

    const minAgeDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    const minUtc = Date.UTC(minAgeDate.getFullYear(), minAgeDate.getMonth(), minAgeDate.getDate());
    if (dt.getTime() > minUtc) {
        return { ok: false, error: 'Debes tener al menos 10 años' };
    }

    const value = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { ok: true, value };
}

/**
 * Formatea birth_date de PostgreSQL a YYYY-MM-DD string.
 * @param {Date|string|null|undefined} rowValue
 * @returns {string|null}
 */
export function formatBirthDateForApi(rowValue) {
    if (rowValue == null) return null;
    if (typeof rowValue === 'string') {
        const m = rowValue.match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : rowValue.slice(0, 10);
    }
    if (rowValue instanceof Date) {
        const y = rowValue.getUTCFullYear();
        const mo = String(rowValue.getUTCMonth() + 1).padStart(2, '0');
        const d = String(rowValue.getUTCDate()).padStart(2, '0');
        return `${y}-${mo}-${d}`;
    }
    return null;
}
