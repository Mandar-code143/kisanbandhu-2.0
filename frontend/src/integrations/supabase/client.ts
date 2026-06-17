import { auth as apiAuth } from '@/lib/api';
import { demoJobs, demoWorkers, demoEquipment, demoSchemes, demoNotifications } from '@/lib/demo-data';

// Shim so pages that import supabase still work. Returns demo data for known tables.

const TABLE_DATA: Record<string, any[]> = {
  'jobs': demoJobs,
  'profiles': [],
  'job_applications': [],
  'notifications': demoNotifications,
  'workers': demoWorkers,
  'equipment': demoEquipment,
  'schemes': demoSchemes,
};

function buildQuery(table: string) {
  const rows = TABLE_DATA[table] || [];
  let filtered = [...rows];
  let selectedRows = filtered;

  const result = (data: any = selectedRows, extra: Record<string, any> = {}) => ({
    data,
    error: null,
    ...extra,
  });

  const thenable = (getResult: () => any = () => result()) => ({
    then: (resolve: (value: any) => void, reject?: (reason: any) => void) => {
      Promise.resolve()
        .then(getResult)
        .then(resolve, reject);
    },
  });

  const q: any = {
    select: (_columns: string, opts?: any) => {
      selectedRows = filtered;

      if (opts?.count === 'exact') {
        return {
          ...q,
          then: (resolve: (value: any) => void, reject?: (reason: any) => void) => {
            Promise.resolve(result(null, { count: filtered.length })).then(resolve, reject);
          },
        };
      }

      return q;
    },
    eq: (col: string, val: any) => {
      filtered = filtered.filter((r: any) => r[col] === val || r[col.replace('_id', 'Id')] === val || r[col.replace('farmer_', '')] === val);
      selectedRows = filtered;
      return q;
    },
    in: (col: string, vals: any[]) => {
      filtered = filtered.filter((r: any) => vals.includes(r[col]) || vals.includes(r[col.replace('_id', 'Id')]));
      selectedRows = filtered;
      return q;
    },
    order: (_col: string, _dir?: any) => q,
    limit: (n: number) => {
      selectedRows = filtered.slice(0, n);
      return q;
    },
    single: () => Promise.resolve(result(selectedRows[0] || null)),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve(result(Array.isArray(data) ? data[0] : data)),
        ...thenable(() => result(Array.isArray(data) ? data : [data])),
      }),
      ...thenable(() => result(data)),
    }),
    update: (_data: any) => ({
      eq: () => thenable(() => result(null)),
      ...thenable(() => result(null)),
    }),
    delete: () => ({
      eq: () => thenable(() => result(null)),
      ...thenable(() => result(null)),
    }),
    upsert: (_data: any) => thenable(() => result(null)),
    ...thenable(() => result(selectedRows)),
  };
  return q;
}

export const supabase = {
  from: (table: string) => buildQuery(table),

  storage: {
    from: (_bucket: string) => ({
      upload: async (_path: string, _file: any, _opts?: any) => ({ error: null, data: { path: '' } }),
      getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      list: async (_path: string) => ({ data: [], error: null }),
      remove: async (_paths: string[]) => ({ data: [], error: null }),
    }),
  },

  channel: (_name: string) => ({
    on: (_event: string, _config: any, _callback: (payload: any) => void) => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    subscribe: () => ({ unsubscribe: () => {} }),
  }),

  removeChannel: (_channel: any) => {},

  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const result = await apiAuth.login(email, password);
        localStorage.setItem('krushi_token', result.accessToken);
        return { data: { user: result.user }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const result = await apiAuth.register({
          phone: options?.data?.phone || email,
          email,
          password,
          firstName: options?.data?.fullName || email,
          role: (options?.data?.role || 'FARMER').toUpperCase(),
          district: options?.data?.district,
          languagePref: options?.data?.languagePref,
        });
        localStorage.setItem('krushi_token', result.accessToken);
        return { data: { user: result.user }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },
    signOut: async () => {
      localStorage.removeItem('krushi_token');
      return { error: null };
    },
    getUser: async () => {
      const cached = localStorage.getItem('krushi_user');
      const user = cached ? JSON.parse(cached) : null;
      return { data: { user: user ? { id: user.id, user_metadata: { role: user.role } } : null }, error: null };
    },
    getSession: async () => {
      const token = localStorage.getItem('krushi_token');
      const cached = localStorage.getItem('krushi_user');
      const user = cached ? JSON.parse(cached) : null;
      return { data: { session: token ? { access_token: token, user: user ? { id: user.id, email: user.email, user_metadata: { role: user.role } } : null } : null }, error: null };
    },
    onAuthStateChange: (_callback: (event: string, session: any) => void) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    resetPasswordForEmail: async (email: string) => {
      try { await apiAuth.forgotPassword(email); return { data: {}, error: null }; }
      catch (err: any) { return { data: {}, error: { message: err.message } }; }
    },
    updateUser: async () => {
      return { data: { user: null }, error: null };
    },
  },
};
