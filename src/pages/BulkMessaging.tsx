import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Filter,
  Paperclip,
  Send,
  Clock,
} from "lucide-react";

export default function BulkMessaging() {
  const [type, setType] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">New Broadcast</h2>
          <p className="text-gray-500 text-sm">
            Compose and send messages to targeted member groups.
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => setType("email")}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              type === "email"
                ? "bg-gray-200 font-medium"
                : "bg-white"
            }`}
          >
            <Mail size={16} />
            Email
          </button>

          <button
            onClick={() => setType("sms")}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              type === "sms"
                ? "bg-gray-200 font-medium"
                : "bg-white"
            }`}
          >
            <MessageSquare size={16} />
            SMS Text
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-2 space-y-6">

          {/* TARGET AUDIENCE */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter size={16} />
                Target Audience
              </h3>

              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                ~1054 Recipients
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select className="border px-3 py-2 rounded text-sm">
                <option>Business Category</option>
              </select>

              <select className="border px-3 py-2 rounded text-sm">
                <option>Membership Status</option>
              </select>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">
                Exclude Specific Members (Optional)
              </p>

              <div className="border rounded px-3 py-2 flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-1 text-xs rounded">
                  RwandaTech Solutions ✕
                </span>

                <input
                  placeholder="Search to exclude..."
                  className="outline-none text-sm w-full"
                />
              </div>
            </div>
          </div>

          {/* MESSAGE CONTENT */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <h3 className="font-semibold">Message Content</h3>

            {/* SUBJECT */}
            {type === "email" && (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Important Update from Rwanda ICT Chamber"
                className="w-full border px-3 py-2 rounded text-sm"
              />
            )}

            {/* BODY */}
            <div className="border rounded-md">
              <div className="border-b px-3 py-2 text-sm flex gap-3 text-gray-500">
                B I U • 😊
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Write your email content here..."
                className="w-full px-3 py-2 text-sm outline-none resize-none"
              />
            </div>

            {/* ATTACH */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Paperclip size={16} />
              Attach Files
              <span className="text-xs">Max 5MB total</span>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between pt-3">
              <button className="border px-4 py-2 rounded text-sm">
                Save as Draft
              </button>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 border px-4 py-2 rounded text-sm">
                  <Clock size={14} />
                  Schedule
                </button>

                <button className="flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded text-sm font-medium">
                  <Send size={14} />
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - PREVIEW */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">

          <h3 className="font-semibold flex items-center gap-2">
            👁 Live Preview
          </h3>

          <div className="border rounded-lg overflow-hidden">

            {/* HEADER */}
            <div className="bg-gray-800 text-white text-xs p-2">
              preview.email.client
            </div>

            {/* BODY */}
            <div className="p-4 text-sm space-y-3">
              <p>
                <strong>From:</strong> ICT Chamber Communications
              </p>

              <p>
                <strong>To:</strong> [Member Company Name]
              </p>

              <p className="font-medium">
                {subject || "Subject line will appear here"}
              </p>

              <div className="text-gray-500">
                {body ||
                  "Your email body content will be rendered here."}
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-gray-50 text-xs text-center p-3 text-gray-400">
              You are receiving this email because you are a registered member
              of the Rwanda ICT Chamber.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}