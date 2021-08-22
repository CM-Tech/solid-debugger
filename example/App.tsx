import { createSignal } from "solid-js";
import { Show } from "solid-js/web";

const Counter = () => {
  const [count, setCount] = createSignal(0, {
    name: "counter-signal",
  });
  const increment = () => setCount(count() + 1);

  return (
    <button onClick={increment} type="button">
      {count()}
    </button>
  );
};

export const App = () => {
  const [visible, setVisible] = createSignal(false, {
    name: "visible-signal-edit-me-in-debugger",
  });
  return (
    <div>
      <button
        onClick={() => {
          setVisible(!visible());
        }}
      >
        Toggle visibility
      </button>
      <Show when={visible()}>
        <Counter />
      </Show>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur elit id nisl lobortis, id dapibus
        urna rutrum. Fusce vel metus sem. Sed ut erat quis risus sodales viverra in a lectus. Morbi feugiat urna nec
        egestas cursus. Vestibulum nec risus et elit consectetur ultrices. Integer ac lorem consectetur, cursus ligula
        vitae, aliquam dui. Phasellus feugiat at nisl et commodo. Donec luctus, felis at imperdiet scelerisque, lacus
        lorem viverra leo, sed aliquam ex purus quis eros. Pellentesque at feugiat justo. Quisque ligula elit, rutrum
        vulputate commodo id, placerat in purus. Maecenas nulla magna, viverra sit amet purus in, dapibus suscipit
        velit. Cras molestie ac leo ut mattis. Nam nec lacus eleifend, hendrerit urna id, accumsan felis.
      </p>

      <p>
        Donec in dapibus nunc. Curabitur ullamcorper magna sed accumsan accumsan. Proin ut nibh ac lectus tempor
        molestie eu eget sapien. Vestibulum vitae metus leo. Integer massa neque, placerat sed efficitur id, auctor non
        nunc. In imperdiet maximus felis at faucibus. Nam facilisis lorem nunc, nec pretium metus posuere vitae. Aliquam
        id ex in ex fringilla mollis et vel lacus. In vitae metus imperdiet, porta massa a, tempor nibh. Donec at
        ultrices erat. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer nunc elit, ultrices sit
        amet dolor blandit, posuere tincidunt leo. Ut sagittis, risus non venenatis tempor, metus nunc facilisis elit,
        vitae elementum dolor tellus vitae metus. Curabitur mattis dui sed euismod faucibus.
      </p>

      <p>
        Aenean aliquet egestas mollis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
        himenaeos. Curabitur sit amet ipsum turpis. Nulla facilisi. Morbi pulvinar libero risus, vel dictum est lacinia
        ultricies. Nullam bibendum vitae lectus at malesuada. Nam eget ultrices ex.
      </p>

      <p>
        Donec dignissim odio non enim placerat suscipit. Phasellus semper dignissim elit quis convallis. Mauris sagittis
        molestie eros ut malesuada. In hac habitasse platea dictumst. Curabitur sit amet purus ac arcu gravida mollis.
        Mauris bibendum, turpis ut vestibulum maximus, erat augue ultricies nisl, quis mollis neque turpis sagittis
        turpis. Praesent at vehicula nisi. Mauris ac diam vehicula, scelerisque urna eu, dignissim libero. Pellentesque
        nec tellus turpis. Sed lacinia massa at neque dapibus porta. In id arcu vestibulum, placerat nibh sed, aliquet
        nisi. Quisque rutrum ex dictum massa laoreet, sit amet bibendum tellus ullamcorper.
      </p>

      <p>
        Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed vitae auctor ligula.
        In ultricies massa ipsum, sed consectetur eros cursus eget. Pellentesque volutpat, dui eu commodo consequat,
        eros magna euismod eros, at aliquam eros enim sed magna. Morbi et laoreet risus. Nulla venenatis laoreet eros
        non ultricies. Etiam sed viverra nisi, porta volutpat mauris. Donec nec tempor dolor. Morbi vehicula, dui nec
        consequat volutpat, libero ipsum imperdiet velit, vel rutrum lectus neque eu ante. Fusce ante urna, lobortis in
        efficitur at, lobortis a nisi. Sed eget nisi et massa malesuada sollicitudin. Nam vitae nulla ultricies neque
        ultrices dignissim et eget purus. Maecenas tellus odio, imperdiet sed sagittis vitae, varius nec justo. Etiam
        vestibulum tellus nec massa condimentum sagittis.
      </p>
    </div>
  );
};
