import {
  Mail,
  MessageSquare,
  Eye,
  Paperclip,
  Clock,
  Send,
  Filter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Image,
  Smile
} from "lucide-react";
import { useState } from "react";

export default function BulkMessaging() {
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const charsRemaining = 160 - body.length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">New Broadcast</h2>
          <p className="text-sm text-gray-500 mt-1">Compose and send messages to targeted member groups.</p>
        </div>

        <div className="inline-flex w-full sm:w-auto bg-white border border-gray-200 rounded-md p-1 gap-1">
          <button
            onClick={() => setChannel("email")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm transition-colors ${
              channel === "email" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail size={15} />
            Email
          </button>
          <button
            onClick={() => setChannel("sms")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm transition-colors ${
              channel === "sms" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare size={15} />
            SMS Text
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Main */}
        <div className="xl:col-span-2 space-y-4">

          {/* Target Audience */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-900 inline-flex items-center gap-2">
                <Filter size={13} className="text-gray-500" />
                Target Audience
              </h3>
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">~1054 Recipients</span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Business Category</label>
                  <select className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full bg-white text-gray-700 outline-none focus:border-gray-400 transition-colors">
                    <option value=""> </option>
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Membership Status</label>
                  <select className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full bg-white text-gray-700 outline-none focus:border-gray-400 transition-colors">
                    <option value=""> </option>
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-1.5">Exclude Specific Members (Optional)</p>
                <div className="flex items-center flex-wrap gap-2 border border-gray-200 rounded-md px-2.5 py-2 min-h-[38px] bg-white cursor-text">
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    RwandaTech Solutions
                    <button className="text-gray-400 hover:text-gray-600 leading-none">×</button>
                  </span>
                  <input
                    placeholder="Search to exclude..."
                    className="flex-1 outline-none text-sm min-w-[120px] text-gray-700 placeholder-gray-300 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-900">Message Content</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Subject line (email only) */}
              {channel === "email" && (
                <div>
                  <p className="text-sm text-gray-700 mb-1.5">Subject Line</p>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Important Update from Rwanda ICT Chamber"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors placeholder-gray-300 text-gray-700"
                  />
                </div>
              )}

              <div>
                <p className="text-sm text-gray-700 mb-1.5">Message Body</p>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
                    <button className="toolbar-btn font-bold text-gray-600 hover:bg-gray-200 px-1.5 py-0.5 rounded text-sm transition-colors">B</button>
                    <button className="toolbar-btn italic text-gray-600 hover:bg-gray-200 px-1.5 py-0.5 rounded text-sm transition-colors">I</button>
                    <span className="w-px h-4 bg-gray-200 mx-0.5" />
                    <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"><AlignLeft size={13} /></button>
                    <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"><AlignCenter size={13} /></button>
                    <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"><AlignRight size={13} /></button>
                    <span className="w-px h-4 bg-gray-200 mx-0.5" />
                    <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"><List size={13} /></button>
                    {channel === "email" && (
                      <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"><Image size={13} /></button>
                    )}
                    <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"><Smile size={13} /></button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={channel === "email" ? "Write your email content here..." : "Write your SMS message here..."}
                    className="w-full p-3 h-28 sm:h-32 outline-none text-sm resize-none text-gray-700 placeholder-gray-300"
                  />

                  {/* Footer */}
                  {channel === "email" ? (
                    <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100 text-xs text-gray-500">
                      <button className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
                        <Paperclip size={13} />
                        Attach Files
                      </button>
                      <span>Max 5MB total</span>
                    </div>
                  ) : (
                    <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-500">
                      {Math.max(0, charsRemaining)} Characters Remaining
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-4 py-3 border-t border-gray-100">
              <button className="border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors text-gray-700">
                Save as Draft
              </button>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-md text-sm text-gray-700">
                  <Clock size={14} />
                  Schedule
                </button>
                <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 transition-colors px-4 py-2 rounded-md text-sm font-medium text-gray-900">
                  <Send size={14} />
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden h-fit">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 relative">
            <Eye size={14} className="text-gray-500" />
            <h3 className="font-semibold text-sm text-gray-900">Live Preview</h3>
            <span className="absolute bottom-0 left-0 h-0.5 w-36 bg-[#0F2A56]" />
          </div>

          <div className="p-4">
            <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
              {/* Browser chrome */}
              <div className="bg-[#1f2d46] px-3 py-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <div className="ml-2 text-[10px] text-blue-200 bg-[#2e3e5b] px-2 py-0.5 rounded">
                  preview.email.client
                </div>
              </div>

              {channel === "email" ? (
                <>
                  <div className="p-3 border-b border-gray-100 text-xs text-gray-600 space-y-0.5 leading-relaxed">
                    <p>From: ICT Chamber Communications</p>
                    <p className="text-gray-400">&lt;noreply@ictchamber.rw&gt;</p>
                    <p>To: [Member Company Name]</p>
                    <p className={`text-sm font-semibold mt-1 ${subject ? "text-gray-900" : "text-gray-400"}`}>
                      {subject || "Subject line will appear here"}
                    </p>
                  </div>

                  <div className={`p-3 min-h-[130px] text-xs ${body ? "text-gray-700" : "text-gray-400 italic"}`}>
                    {body || "Your email body content will be rendered here. Start typing in the editor to see a live preview."}
                  </div>

                  <div className="p-3 border-t border-gray-100 text-center text-[10px] text-gray-400 leading-relaxed">
                    You are receiving this email because you are a registered member of the Rwanda ICT Chamber.
                    <br />
                    <span className="underline cursor-pointer">Unsubscribe</span>
                    {" | "}
                    <span className="underline cursor-pointer">Update Preferences</span>
                  </div>
                </>
              ) : (
                <div className="p-3 min-h-[220px] flex items-center justify-center">
                  <div className="w-full max-w-[200px] rounded-md border border-gray-200 bg-gray-50 p-3 shadow-sm">
                    <p className="text-[11px] text-gray-400 mb-2">SMS Preview</p>
                    <div className={`rounded-md bg-white border border-gray-200 px-3 py-2 text-xs ${body ? "text-gray-700" : "text-gray-400"}`}>
                      {body || "Your SMS text will appear here..."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}