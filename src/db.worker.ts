/* eslint-disable @typescript-eslint/no-explicit-any */
// Web Worker for off-thread SQLite WebAssembly execution
let db: any = null;

const reportProgress = (percent: number) => {
  self.postMessage({ type: 'PROGRESS', payload: percent });
};

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    const { dbUrl } = payload;
    try {
      // Load SQL.js from CDN inside the worker context
      (self as any).importScripts('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js');
      const initSqlJs = (self as any).initSqlJs;
      if (!initSqlJs) {
        throw new Error("SQLite WebAssembly engine (initSqlJs) failed to initialize in worker.");
      }

      // Fetch the 30MB cutoffs.db with progress tracking using the absolute URL passed
      const response = await fetch(dbUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 30720000;
      let downloadedBytes = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream body is not available for database download.");
      }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          downloadedBytes += value.length;
          reportProgress(Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)));
        }
      }

      const allChunks = new Uint8Array(downloadedBytes);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // Initialize WebAssembly
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      db = new SQL.Database(allChunks);
      
      // Query the maximum year dynamically
      let maxYear = 2025;
      try {
        const result = db.exec("SELECT MAX(year) FROM cutoffs");
        if (result && result.length > 0 && result[0].values && result[0].values.length > 0) {
          const val = result[0].values[0][0];
          if (val) maxYear = parseInt(val, 10);
        }
      } catch (e) {
        console.error("Failed to query max year:", e);
      }

      self.postMessage({ type: 'READY', payload: { maxYear } });
    } catch (err: any) {
      self.postMessage({ type: 'ERROR', payload: err.message || "Failed to initialize database in worker." });
    }
  }

  else if (type === 'QUERY') {
    if (!db) {
      self.postMessage({ type: 'QUERY_ERROR', payload: "Database is not loaded yet." });
      return;
    }

    const { sql, params, inputs } = payload;
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);

      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();

      self.postMessage({ type: 'QUERY_RESULTS', payload: { rows, inputs } });
    } catch (err: any) {
      self.postMessage({ type: 'QUERY_ERROR', payload: err.message || "Failed to run prediction query." });
    }
  }
};
