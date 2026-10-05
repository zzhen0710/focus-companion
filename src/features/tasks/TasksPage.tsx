export default function TasksPage() {
  return (
    <section className="page" aria-labelledby="tasks-heading">
      <p className="eyebrow">Give your work a place</p>
      <h1 id="tasks-heading">Tasks</h1>
      <p className="page-intro">A little clarity for what comes next.</p>
      <div className="empty-state">
        <h2>No tasks yet</h2>
        <p>Task management will arrive in a later version, with a simple way to choose and track your work.</p>
      </div>
    </section>
  )
}
