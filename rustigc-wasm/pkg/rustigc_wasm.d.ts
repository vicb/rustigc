/* tslint:disable */
/* eslint-disable */

/** One position fix. */
export interface Fix {
    /** Milliseconds from the instant `Log.datetime` reports. */
    timestamp: number;
    /** Latitude in decimal degrees, north positive. */
    lat: number;
    /** Longitude in decimal degrees, east positive. */
    lon: number;
    /** Pressure altitude in meters. */
    baro_alt: number;
    /** GNSS altitude in meters. */
    gnss_alt: number;
}

/** One flight section, as fix indices into the track it was detected in. */
export interface Flight {
    /** Takeoff. */
    start: number;
    /** Landing. */
    stop: number;
}

/** One header value and who entered it. */
export interface Header {
    /** The value as written, trimmed of its key. */
    text: string;
    origin: "flightrecorder" | "observer" | "pilot" | "unknown";
}

/**
 * What the winning rule of a league scored.
 *
 * Every fix is an index into the track that was scored.
 */
export interface Score {
    /** Identity of the scoring league, `"xcontest"`. */
    league: string;
    /** The rule that won, `"closed fai triangle"`. */
    description: string;
    /** Scored distance in meters, to the nearest millimeter. */
    distance_m: number;
    /** The same distance in kilometers, as the rule presents it. */
    distance_km: number;
    /** Closing leg of a circuit, in kilometers; 0 for an open task. */
    gap_km: number;
    /** Largest gap the rule would still accept, in meters; 0 for an open task. */
    threshold_m: number;
    /** What the rule charged for that gap, in points. */
    penalty: number;
    /** Final score, in league points. */
    score: number;
    /** Multiplier the rule scored at. */
    multiplier: number;
    /** Start of the scored window. */
    takeoff: number;
    /** First fix of the task. */
    entry: number;
    /** Turnpoints of the task, in order. */
    turnpoints: number[];
    /** Last fix of the task. */
    exit: number;
    /** End of the scored window. */
    landing: number;
    /** Whether the task closes on itself. */
    circuit: boolean;
}



/**
 * A parsed IGC log.
 */
export class Log {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Instant this log's fix timestamps count from as an ISO8601 String, or `undefined`
     * without a usable `HFDTE` header.
     */
    datetime(): string | undefined;
    /**
     * Everything the log describes about itself under `league`, as one GeoJSON string.
     *
     * Detects the longest flight, scores it and draws both. Use `export` when the flight and
     * score are already at hand.
     */
    describe(league: string): string;
    /**
     * The log and the layers handed to it, as one GeoJSON string.
     *
     * `window` and `scored` may each be left out; `track` draws the flown line. Every feature
     * declares a `role` — `track`, `marker`, `leg`, `closing`, `score` or `metadata`.
     * `JSON.parse` it for objects.
     *
     * Throws when a layer is not the shape it should be, or reads a fix this log's track does
     * not hold
     */
    export(window?: Flight | null, scored?: Score | null, track?: boolean | null): string;
    /**
     * One fix. Throws when `index` is past the end of the track.
     */
    fix(index: number): Fix;
    /**
     * Flight sections detected in the track, empty when none was.
     */
    flights(): Flight[];
    /**
     * One header, or `undefined` when the log has no such key.
     *
     * `key` is a 3-letter code: `"PLT"` for the pilot, `"GTY"` for the glider, `"DTE"` for the
     * date, ... `header_keys` lists the ones this log carries.
     */
    header(key: string): Header | undefined;
    /**
     * The longest detected flight by fix span, or `undefined` when there is none.
     */
    longest_flight(): Flight | undefined;
    /**
     * Parse IGC file content. Throws when the bytes are not usable IGC.
     */
    constructor(content: Uint8Array);
    /**
     * Score `window` against every rule of `league` and report the best.
     *
     * `window` defaults to the longest detected flight, whether left out or passed `undefined`.
     * `undefined` when nothing could be scored; throws when `league` is not one of
     * `league_names()`, when the window is not one this track holds, or when it is left to
     * detection and there is no flight to take it from.
     */
    score(league: string, window?: Flight | null): Score | undefined;
    /**
     * Offset from UTC to local time in hours, as the recorder declared it in `TZN`, or
     * `undefined` when it declared none.
     */
    tzn(): number | undefined;
    /**
     * Number of fixes in the track.
     */
    readonly fix_count: number;
    /**
     * Every 3-letter code this log carries a header for.
     */
    readonly header_keys: string[];
    /**
     * The whole track, one object per fix.
     */
    readonly track: Fix[];
    /**
     * The same track as raw `#[repr(C)] Fix` bytes, 32 per fix, little-endian.
     *
     * About 10x faster than `track`, if you decode it yourself. The `rustigc-wasm-utils`
     * package ships a decoder; the crate README has the layout.
     */
    readonly track_bytes: Uint8Array;
}

/**
 * A scoring window over a table of coordinates, needing no `Log`.
 */
export class Scorer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Prepare `coords`, interleaved latitude and longitude in decimal degrees, in flight order.
     *
     * Throws unless it holds at least two whole pairs of coordinates that are all in range.
     */
    constructor(coords: Float64Array);
    /**
     * Score the table against every rule of `league` and report the best.
     *
     * Every fix of the result is an index into the table. `undefined` when nothing could be
     * scored; throws when `league` is not one of `league_names()`.
     */
    solve(league: string): Score | undefined;
}

/**
 * Every league name `score` and `describe` accept.
 */
export function league_names(): string[];

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_log_free: (a: number, b: number) => void;
    readonly __wbg_scorer_free: (a: number, b: number) => void;
    readonly league_names: () => [number, number];
    readonly log_datetime: (a: number) => [number, number];
    readonly log_describe: (a: number, b: number, c: number) => [number, number, number, number];
    readonly log_export: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly log_fix: (a: number, b: number) => [number, number, number];
    readonly log_fix_count: (a: number) => number;
    readonly log_flights: (a: number) => [number, number, number];
    readonly log_header: (a: number, b: number, c: number) => [number, number, number];
    readonly log_header_keys: (a: number) => [number, number];
    readonly log_longest_flight: (a: number) => [number, number, number];
    readonly log_new: (a: number, b: number) => [number, number, number];
    readonly log_score: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly log_track: (a: number) => [number, number, number];
    readonly log_track_bytes: (a: number) => [number, number];
    readonly log_tzn: (a: number) => [number, number];
    readonly scorer_new: (a: number, b: number) => [number, number, number];
    readonly scorer_solve: (a: number, b: number, c: number) => [number, number, number];
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
