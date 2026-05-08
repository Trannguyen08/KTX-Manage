function StatGrid({ items }) {
  return (
    <section className="row g-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="col-12 col-sm-6 col-xl-3" key={item.label}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <Icon className="text-primary mb-3" size={22} />
                <p className="text-secondary small mb-1">{item.label}</p>
                <strong className="fs-3 lh-1 d-block">{item.value}</strong>
                <small className="text-secondary">{item.hint}</small>
              </div>
            </article>
          </div>
        );
      })}
    </section>
  );
}

export default StatGrid;
