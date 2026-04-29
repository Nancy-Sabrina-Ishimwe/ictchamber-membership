import { Search, Plus, Calendar, Clock3, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import EventModal from "../components/EventModal";

/* TYPES */
type Event = {
  title: string;
  date: string;
  time: string;
  location: string;
  companies: string[];
  status: "Completed" | "Upcoming";
};

export default function Events() {
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events: Event[] = [
    {
      title: "Q3 Tech Founders Mixer",
      date: "Oct 15, 2023",
      time: "6:00 PM - 9:00 PM",
      location: "Innovation Hub, Downtown",
      companies: ["Acme Corp", "TechFlow", "CloudSync"],
      status: "Completed",
    },
    {
      title: "SaaS Growth Strategies Summit",
      date: "Nov 02, 2023",
      time: "9:00 AM - 5:00 PM",
      location: "Grand Hotel Convention Center",
      companies: ["Globex", "Soylent Corp", "Initech"],
      status: "Completed",
    },
    {
      title: "AI in Enterprise Workshop",
      date: "Nov 18, 2023",
      time: "1:00 PM - 4:00 PM",
      location: "Virtual Event",
      companies: ["Cyberdyne Systems", "Tyrell Corp"],
      status: "Completed",
    },
    {
      title: "Annual Partner Awards Gala",
      date: "Dec 10, 2023",
      time: "7:00 PM - 11:00 PM",
      location: "Metropolitan Museum",
      companies: ["Umbrella Corp", "Wayne Enterprises"],
      status: "Completed",
    },
  ];

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;
    return events.filter((event) =>
      [
        event.title,
        event.location,
        event.date,
        event.time,
        event.status,
        ...event.companies,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [events, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* SEARCH + BUTTON */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 w-full sm:max-w-[430px]">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search events"
            className="ml-2 outline-none text-sm w-full bg-transparent"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-yellow-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors"
        >
          <Plus size={15} />
          Add Event
        </button>
      </div>

      {/* TITLE */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent & Upcoming Events</h3>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredEvents.map((e, i) => (
          <EventCard key={i} event={e} onClick={() => setSelectedEvent(e)} />
        ))}
      </div>

      {/* MODAL */}
      {openModal && <EventModal onClose={() => setOpenModal(false)} />}
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
      className="w-full text-left bg-white rounded-md shadow-sm border border-gray-200 p-4 flex flex-col h-full min-h-[255px] transition-all duration-200 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >

      {/* TOP */}
      <div className="space-y-2.5">

        <h4 className="font-semibold text-sm leading-snug text-gray-900">
          {event.title}
        </h4>

        <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full w-fit">
          <CheckCircle2 size={11} />
          {event.status}
        </span>

        {/* DETAILS */}
        <div className="space-y-1.5 text-xs text-gray-600">

          <div className="flex items-center gap-2 min-w-0">
            <Calendar size={13} className="text-gray-400 flex-shrink-0" />
            {event.date}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Clock3 size={13} className="text-gray-400 flex-shrink-0" />
            {event.time}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={13} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

        </div>

        <hr className="my-2 border-gray-100" />

      </div>

      {/* COMPANIES */}
      <div className="mt-auto pt-1">
        <p className="text-[10px] tracking-wide text-gray-500 flex items-center gap-1 mb-2">
          <Building2 size={11} />
          PARTICIPATING COMPANIES
        </p>

        <div className="flex flex-wrap gap-1.5">
          {event.companies.slice(0, 2).map((c, i) => (
            <span
              key={i}
              className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {c}
            </span>
          ))}

          {event.companies.length > 2 && (
            <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
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
          <p><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{event.date}</span></p>
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