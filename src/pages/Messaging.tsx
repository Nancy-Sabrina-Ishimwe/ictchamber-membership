import {
  Mail,
  MessageSquare,
  Eye,
  Paperclip,
  Clock,
  Send,
} from "lucide-react";

export default function Messaging() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">New Broadcast</h2>
          <p className="text-sm text-gray-500">
            Compose and send messages to targeted member groups.
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-gray-100 rounded-md p-1">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-md text-sm shadow-sm">
            <Mail size={16} />
            Email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
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
          <div className="bg-white border rounded-xl shadow-sm">

            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h3 className="font-semibold">Target Audience</h3>
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                ~1054 Recipients
              </span>
            </div>

            <div className="p-5 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <select className="border rounded-md px-3 py-2 text-sm">
                  <option>Business Category</option>
                </select>

                <select className="border rounded-md px-3 py-2 text-sm">
                  <option>Membership Status</option>
                </select>
              </div>

              <div>
                <p className="text-sm mb-2">
                  Exclude Specific Members (Optional)
                </p>

                <div className="flex items-center border rounded-md px-3 py-2 gap-2 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    RwandaTech Solutions ✕
                  </span>

                  <input
                    placeholder="Search to exclude..."
                    className="flex-1 outline-none text-sm"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* MESSAGE CONTENT */}
          <div className="bg-white border rounded-xl shadow-sm">

            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold">Message Content</h3>
            </div>

            <div className="p-5 space-y-4">

              {/* SUBJECT */}
              <div>
                <p className="text-sm mb-1">Subject Line</p>
                <input
                  placeholder="e.g., Important Update from Rwanda ICT Chamber"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* EDITOR */}
              <div className="border rounded-md">

                {/* TOOLBAR */}
                <div className="flex gap-4 px-3 py-2 border-b text-gray-500 text-sm">
                  <b>B</b>
                  <i>I</i>
                  <span>≡</span>
                  <span>•</span>
                  <span>😊</span>
                </div>

                {/* TEXTAREA */}
                <textarea
                  placeholder="Write your email content here..."
                  className="w-full p-3 h-40 outline-none text-sm"
                />

                {/* FOOTER */}
                <div className="flex justify-between items-center px-3 py-2 border-t text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} />
                    Attach Files
                  </div>

                  <span>Max 5MB total</span>
                </div>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center px-5 py-4 border-t">

              <button className="border px-4 py-2 rounded-md text-sm">
                Save as Draft
              </button>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm text-gray-500">
                  <Clock size={14} />
                  Schedule
                </button>

                <button className="flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded-md text-sm font-medium text-black">
                  <Send size={14} />
                  Send Now
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* RIGHT SIDE - PREVIEW */}
        <div className="bg-white border rounded-xl shadow-sm">

          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <Eye size={16} />
            <h3 className="font-semibold">Live Preview</h3>
          </div>

          <div className="p-4">

            {/* EMAIL MOCK */}
            <div className="bg-[#0F2A44] text-white px-3 py-2 rounded-md mb-3 text-xs flex items-center gap-3">

  {/* DOTS */}
  <div className="flex gap-1">
    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
    <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
    <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
  </div>

  {/* TITLE */}
  <span className="ml-2">preview.email.client</span>

</div>

              <p className="text-xs text-gray-600">
                From: ICT Chamber Communications
              </p>

              <p className="text-xs text-gray-600 mb-2">
                To: [Member Company Name]
              </p>

              <p className="text-sm font-medium mb-4">
                Subject line will appear here
              </p>

              <p className="text-xs text-gray-400">
                Your email body content will be rendered here...
              </p>

            </div>

            {/* FOOTER */}
            <div className="mt-4 text-center text-xs text-gray-400">
              You are receiving this email because you are a registered member.
              <br />
              <span className="underline cursor-pointer">
                Unsubscribe
              </span>{" "}
              |{" "}
              <span className="underline cursor-pointer">
                Update Preferences
              </span>
            </div>

          </div>

        </div>

      </div>
    
  );
}