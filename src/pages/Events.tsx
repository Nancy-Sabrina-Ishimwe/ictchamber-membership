import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Building2,
  Layers,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import EventModal, { type EventFormValue } from "../components/EventModal";
import { api } from "../lib/api";

/* TYPES */
type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  companies: string[];
  notes?: string;
  status: "Completed" | "Upcoming";
  eventTimestamp: number | null;
};

type StatusFilter = "all" | Event["status"];

export default function Events() {
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<{
        data?: Array<{
          id: number;
          title: string;
          eventDate: string;
          eventTime: string;
          location?: string | null;
          notes?: string | null;
          companies?: unknown;
          status: "COMPLETED" | "UPCOMING";
        }>;
      }>("/events");

      const mapped: Event[] = (response.data.data ?? []).map((item) => {
        const parsedDate = new Date(item.eventDate);
        const eventTimestamp = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getTime();
        return {
          id: String(item.id),
          title: item.title,
          date: item.eventDate,
          time: item.eventTime,
          location: item.location?.trim() ? item.location.trim() : "Virtual Event",
          companies: Array.isArray(item.companies)
            ? item.companies.filter((company): company is string => typeof company === "string")
            : [],
          notes: item.notes ?? "",
          status: item.status === "COMPLETED" ? "Completed" : "Upcoming",
          eventTimestamp,
        };
      });
      setEvents(mapped);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load events.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  const saveEvent = async (payload: EventFormValue) => {
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await api.post<{
        message?: string;
        invitations?: { sentCount?: number; failedCount?: number };
      }>("/events", {
        title: payload.title,
        eventDate: payload.date,
        eventTime: payload.time,
        location: payload.location,
        notes: payload.notes,
        companies: payload.companies,
      });
      const apiMessage = response.data.message?.trim();
      if (apiMessage) {
        setSuccessMessage(apiMessage);
      } else if ((response.data.invitations?.sentCount ?? 0) > 0) {
        setSuccessMessage("Event created and invitation emails were sent.");
      } else {
        setSuccessMessage("Event created successfully.");
      }
      await fetchEvents();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to create event.";
      setError(message);
      throw new Error(message);
    }
  };

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const event of events) {
      if (event.location) set.add(event.location);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [events]);

  const rangeStartMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const rangeEndMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      if (statusFilter !== "all" && event.status !== statusFilter) return false;
      if (locationFilter !== "all" && event.location !== locationFilter) return false;

      if (rangeStartMs !== null || rangeEndMs !== null) {
        if (event.eventTimestamp === null) return false;
        if (rangeStartMs !== null && event.eventTimestamp < rangeStartMs) return false;
        if (rangeEndMs !== null && event.eventTimestamp > rangeEndMs) return false;
      }

      if (!query) return true;
      return [
        event.title,
        event.location,
        formatDateLabel(event.date),
        event.time,
        event.status,
        event.notes ?? "",
        ...event.companies,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [events, searchQuery, statusFilter, locationFilter, rangeStartMs, rangeEndMs]);

  const filterBarActive =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    locationFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLocationFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Events</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Schedule and review chamber events with participating companies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-yellow-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors"
        >
          <Plus size={15} />
          Add Event
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Layers size={17} className="text-gray-400 flex-shrink-0" aria-hidden />
            <span>Filter events</span>
            {filterBarActive ? (
              <span className="text-xs font-normal text-gray-500">
                ({filteredEvents.length} of {events.length})
              </span>
            ) : null}
          </div>
          {filterBarActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1.5 px-2 rounded-md hover:bg-gray-50"
            >
              <X size={15} className="text-gray-400" aria-hidden />
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" aria-hidden />
          <input
            type="search"
            placeholder="Search title, location, company, notes..."
            className="outline-none text-sm w-full min-w-0 bg-transparent placeholder:text-gray-400"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search events"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            placeholder="All statuses"
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </FilterSelect>

          <FilterSelect
            label="Location"
            value={locationFilter}
            onChange={setLocationFilter}
            placeholder="All locations"
            icon={<MapPin size={14} className="text-gray-400" />}
          >
            {locationOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </FilterSelect>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-gray-500">Event from</span>
            <label className="relative flex items-center rounded-md border border-gray-200 bg-white">
              <Calendar size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" aria-hidden />
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                max={dateTo || undefined}
                className="w-full rounded-md bg-transparent py-2 pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-yellow-400/80 focus:border-yellow-400"
                aria-label="Event date from"
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-gray-500">Event to</span>
            <label className="relative flex items-center rounded-md border border-gray-200 bg-white">
              <Calendar size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" aria-hidden />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                min={dateFrom || undefined}
                className="w-full rounded-md bg-transparent py-2 pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-yellow-400/80 focus:border-yellow-400"
                aria-label="Event date to"
              />
            </label>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent & Upcoming Events</h3>
      {isLoading ? <p className="text-sm text-gray-500">Loading events...</p> : null}
      {successMessage ? (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {successMessage}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {/* GRID / EMPTY */}
      {!isLoading && !error && events.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-900">No events yet</p>
          <p className="mt-1 text-sm text-gray-500">
            When you schedule partner events, they will appear here. Use{" "}
            <span className="font-medium text-gray-700">Add Event</span> to create the first one.
          </p>
        </div>
      ) : !isLoading && !error && filteredEvents.length === 0 && events.length > 0 ? (
        <div className="rounded-md border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-600">
          No events match your filters. Adjust filters or{" "}
          <button type="button" onClick={clearFilters} className="font-medium text-[#0F2A56] hover:underline">
            clear filters
          </button>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {!isLoading
            ? filteredEvents.map((e) => (
                <EventCard key={e.id} event={e} onClick={() => setSelectedEvent(e)} />
              ))
            : null}
        </div>
      )}

      {/* MODAL */}
      {openModal && <EventModal onClose={() => setOpenModal(false)} onSave={saveEvent} />}
      {selectedEvent ? (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      ) : null}
    </div>
  );
}

/* ================= CARD ================= */

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
      <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg border border-gray-300 bg-neutral-50 p-4 flex flex-col h-full min-h-[255px] shadow-md ring-1 ring-black/[0.04] transition-all duration-200 hover:bg-white hover:border-gray-400 hover:shadow-lg hover:ring-black/[0.06] hover:-translate-y-0.5 cursor-pointer outline-none focus:outline-none focus-visible:outline-none active:outline-none"
    >

      {/* TOP */}
      <div className="space-y-2.5">

        <h4 className="font-semibold text-sm leading-snug text-gray-950">
          {event.title}
        </h4>

        <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-800 border border-gray-200/80 px-2 py-1 rounded-full w-fit">
          <CheckCircle2 size={11} className="text-gray-700" />
          {event.status}
        </span>

        {/* DETAILS */}
        <div className="space-y-1.5 text-xs text-gray-800">

          <div className="flex items-center gap-2 min-w-0">
            <Calendar size={13} className="text-gray-500 flex-shrink-0" />
            {formatDateLabel(event.date)}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Clock3 size={13} className="text-gray-500 flex-shrink-0" />
            {event.time}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={13} className="text-gray-500 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {event.notes?.trim() ? (
            <div className="flex gap-2 min-w-0 pt-0.5">
              <FileText size={13} className="text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-700 line-clamp-3 break-words leading-relaxed">{event.notes.trim()}</p>
            </div>
          ) : null}

        </div>

        <hr className="my-2 border-gray-200" />

      </div>

      {/* COMPANIES */}
      <div className="mt-auto pt-1">
        <p className="text-[10px] tracking-wide text-gray-600 font-medium flex items-center gap-1 mb-2">
          <Building2 size={11} className="text-gray-600" />
          PARTICIPATING COMPANIES
        </p>

        <div className="flex flex-wrap gap-1.5">
          {event.companies.slice(0, 2).map((c, i) => (
            <span
              key={i}
              className="text-[11px] bg-gray-100 text-gray-800 border border-gray-200/90 px-2 py-1 rounded-full"
            >
              {c}
            </span>
          ))}

          {event.companies.length > 2 && (
            <span className="text-[11px] bg-gray-100 text-gray-800 border border-gray-200/90 px-2 py-1 rounded-full">
              +{event.companies.length - 2} more
            </span>
          )}
        </div>
      </div>

    </button>
  );
}

function EventDetailsModal({ event, onClose }: { event: Event; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-md border border-gray-200 bg-white shadow-xl"
        onClick={(evt) => evt.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Event Details</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <div className="space-y-2 p-4 text-sm">
          <p><span className="text-gray-500">Title:</span> <span className="font-medium text-gray-900">{event.title}</span></p>
          <p><span className="text-gray-500">Status:</span> <span className="font-medium text-gray-900">{event.status}</span></p>
          <p><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{formatDateLabel(event.date)}</span></p>
          {event.notes ? <p><span className="text-gray-500">Notes:</span> <span className="font-medium text-gray-900">{event.notes}</span></p> : null}
          <p><span className="text-gray-500">Time:</span> <span className="font-medium text-gray-900">{event.time}</span></p>
          <p><span className="text-gray-500">Location:</span> <span className="font-medium text-gray-900">{event.location}</span></p>
          <div className="pt-1">
            <p className="text-gray-500">Participating Companies:</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {event.companies.map((company) => (
                <span key={company} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  icon,
  children,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-1.5 min-w-0">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 pointer-events-none">{icon}</span>
        ) : null}
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-md border border-gray-200 bg-white py-2 pr-9 text-sm text-gray-900 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/80 ${icon ? "pl-8" : "pl-2.5"}`}
        >
          <option value="all">{placeholder}</option>
          {children}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          aria-hidden
        />
      </div>
    </div>
  );
}