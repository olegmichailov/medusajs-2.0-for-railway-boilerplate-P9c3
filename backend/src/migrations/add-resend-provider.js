module.exports = {
  async up({ queryRunner }) {
    await queryRunner.query(`
      INSERT INTO public.notification_provider (id, created_at, updated_at) 
      VALUES ('resend', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  },

  async down({ queryRunner }) {
    await queryRunner.query(`
      DELETE FROM public.notification_provider WHERE id = 'resend';
    `);
  },
};
