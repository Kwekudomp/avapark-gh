import SectionHeader from "./SectionHeader";

const POLICIES = [
  {
    title: "General",
    items: [
      "You must be 18 and above to rent a campsite.",
      "Unauthorised weapons are not allowed on the premises.",
      "We reserve the right to ask any camper or guest whose conduct is causing a disturbance, endangering life, or breaking campground rules to leave. Refunds will not be granted in these cases.",
    ],
  },
  {
    title: "Reservation & Deposit",
    items: [
      "2-night minimum required. Holidays require a 3-night stay. If available, 1-night stays may be made on the day of the reservation before noon.",
      "Deposits become non-refundable 14 days before your arrival date.",
      "The remaining balance is due at check-in.",
      "If you don't arrive by noon the day after your scheduled arrival (without notifying us), your reservation will be cancelled with no refund or credit.",
      "In some cases we may need to move your reservation to a comparable site for occupancy reasons. We will notify you of any changes.",
    ],
  },
  {
    title: "Cancellation Policy",
    items: [
      "14 days before arrival, we will refund your deposit minus GHC 400 for changes or cancellations.",
      "Camping is an outdoor experience. We do not give refunds for discomfort, acts of nature, bad weather, or any other reason within 14 days of your arrival date.",
      "To cancel, simply contact us before your scheduled arrival.",
    ],
  },
  {
    title: "Site Occupancy",
    items: [
      "Maximum of 50 people per group.",
      "2 adults can book a slot within the 50 slots available over the weekend.",
      "Groups are welcome to book the entire campsite for events and exclusive programmes.",
    ],
  },
  {
    title: "Visitor Policy",
    items: [
      "All visitors must register at the office. Only two visitors are allowed per campsite per day.",
      "All visitors must leave the campground before 10:00 PM.",
    ],
  },
  {
    title: "Quiet Hours",
    items: [
      "Quiet hours are 10:00 PM to 7:00 AM.",
      "Please keep noise levels low and lights at a minimum intensity.",
      "If staff notifies a site of a quiet hour violation and any occupant refuses to cooperate, all occupants of that site may be asked to leave without refund.",
      "\"Quiet Cove\" is a 24-hour quiet area. Please keep voices low and do not play music.",
    ],
  },
  {
    title: "Pet Policy",
    items: [
      "Pets must be kept on a handheld leash no longer than 5 feet and must be well-behaved at all times.",
    ],
  },
  {
    title: "Campfire Rules",
    items: [
      "Fires must be completely out and doused with water at the end of the evening or anytime you leave your site, including at checkout.",
      "Please observe any fire condition notices posted around the campground.",
      "Do not move fire pits from their designated locations.",
      "Do not burn trash in fire pits.",
    ],
  },
  {
    title: "Trash & Cleanliness",
    items: [
      "Please sort your returnable bottles and cans.",
      "Do not put trash in fire pits. Doing so will incur a GHC 30 cleaning fee.",
      "Please leave your campsite the way you found it. Picnic tables must not be removed from sites.",
    ],
  },
];

export default function CampgroundPolicies() {
  return (
    <section className="py-24 px-[5%]">
      <SectionHeader
        tag="KNOW BEFORE YOU CAMP"
        title="Campground Policies"
        description="Please make sure anyone staying at Hidden Paradise knows and understands what is allowed. Anyone failing to follow these rules may be asked to leave. Parents are responsible for their children's safety at all times."
      />
      <div className="max-w-[900px] mx-auto space-y-8">
        <div className="bg-bg-alt rounded-xl p-4 border border-border">
          <p className="text-sm text-text-secondary">
            Our top priority is protecting the health, safety, and well-being of our visitors and staff. We actively monitor the park to make sure everyone is safe and enjoying their stay.
          </p>
        </div>

        <div className="bg-bg-alt rounded-xl p-4 border border-border">
          <p className="text-sm text-text-secondary">
            <span className="font-bold text-dark">Terms of Change:</span> Changes can be made by contacting us at least 1 day before your scheduled arrival. Reservations with a departure date more than 3 months out cannot be changed for 18 days after the booking was made. There is no fee for changes unless the reservation is cancelled.
          </p>
        </div>

        {POLICIES.map((section) => (
          <div key={section.title}>
            <h3 className="font-display text-lg font-bold text-primary mb-3">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 border border-border"
                >
                  <span className="text-accent font-bold text-sm mt-0.5">●</span>
                  <p className="text-sm text-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
