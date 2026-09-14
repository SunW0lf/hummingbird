export default {
  async fetch() {
    return new Response(
      "XFMR\n\na transduction commons\n\nSignals only.",
      {
        headers: {
          "content-type": "text/plain; charset=UTF-8",
        },
      },
    );
  },
};
