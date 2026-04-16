<template>
  <div class="row mb-4 g-4">
    <div class="col-12">
      <div class="card welcome-card">
        <div class="card-body py-4 page-header-content">
          <h2 class="mb-2">{{ title }}</h2>
          <div class="page-actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseHeader",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.welcome-card {
  background: none;
  border: none;
}

.welcome-card h2 {
  color: #2d3748;
  font-weight: 700;
  font-size: 2rem;
}

.page-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 576px) {
  .page-header-content {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
