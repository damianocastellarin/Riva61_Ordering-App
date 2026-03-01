export const state = {
  stepIndex: 0,
  risposte: {}
};

export function resetState() {
  state.stepIndex = 0;
  state.risposte = {};
  sessionStorage.removeItem("ordine_bar_salvato");
}