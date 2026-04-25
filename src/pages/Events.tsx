import { Search, Plus, Calendar, Clock, MapPin, Building2 } from "lucide-react";
import { useState } from "react";
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

  return (
    <div className="space-y-6">

      {/* SEARCH + BUTTON */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center border rounded-md px-3 py-2 w-[400px]">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search events"
            className="ml-2 outline-none text-sm w-full"
          />
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-400"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {/* TITLE */}
      <h3 className="text-lg font-semibold">Recent & Upcoming Events</h3>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-5">
        {events.map((e, i) => (
          <EventCard key={i} event={e} />
        ))}
      </div>

      {/* MODAL */}
      {openModal && <EventModal onClose={() => setOpenModal(false)} />}
    </div>
  );
}

/* ================= CARD ================= */

function EventCard({ event }: { event: Event }) {
  return (
    // <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between h-[260px]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-black hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between h-[260px]">

      {/* TOP */}
      <div className="space-y-3">

        <h4 className="font-semibold text-sm leading-snug">
          {event.title}
        </h4>

        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full w-fit">
          ● {event.status}
        </span>

        {/* DETAILS */}
        <div className="space-y-2 text-sm text-gray-600">

          <div className="flex items-center gap-2">
            <Calendar size={14} />
            {event.date}
          </div>

          <div className="flex items-center gap-2">
            <Clock size={14} />
            {event.time}
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={14} />
            {event.location}
          </div>

        </div>

        <hr className="my-2" />

      </div>

      {/* COMPANIES */}
      <div>
        <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-2">
          <Building2 size={12} />
          PARTICIPATING COMPANIES
        </p>

        <div className="flex flex-wrap gap-2">
          {event.companies.slice(0, 2).map((c, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full"
            >
              {c}
            </span>
          ))}

          {event.companies.length > 2 && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              +{event.companies.length - 2} more
            </span>
          )}
        </div>
      </div>

    </div>
  );
}