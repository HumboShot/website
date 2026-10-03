(() => {
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };

  const dirs = {};
  for (const section of document.querySelectorAll('section')) {
    const list = section.querySelector('ul');
    const match = section.querySelector('.cmd').textContent.match(/~\/(\w+)\$\s*cat\s+(\S+)/);
    if (list && match) dirs[match[1]] = { file: match[2], list };
  }

  const links = new Map();
  for (const link of document.querySelectorAll('section ul a')) {
    links.set(link.textContent.replace(/\s+/g, ' ').trim().toLowerCase(), link);
  }

  const secretFile = '.secret.txt';
  const cursor = document.querySelector('.cursor');
  const intro = document.querySelector('#intro .typeout');
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400;

  let cwd = '';
  const history = [];
  let index = 0;

  const prompt = dir => {
    const span = el('span', 'prompt');
    span.append(el('span', 'pre', 'visitor@website:'), dir ? `~/${dir}$` : '~$');
    return span;
  };

  const text = (...lines) => el('p', 'lines', lines.join('\n'));

  const resolve = path => {
    const parts = path === '~' || path.startsWith('~/') ? [] : cwd ? [cwd] : [];
    for (const part of path.replace(/^~\/?/, '').split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    const [dir, file, ...rest] = parts;
    if (!dir) return { dir: '' };
    if (dir === secretFile && !file) return { dir: '', file: dir };
    if (!dirs[dir] || rest.length) return null;
    if (!file) return { dir };
    return file === dirs[dir].file ? { dir, file } : null;
  };

  const entries = dir => dir ? [dirs[dir].file] : Object.keys(dirs).map(name => name + '/');

  const splitFlags = args => ({
    flags: args.filter(arg => arg.startsWith('-')).join(''),
    paths: args.filter(arg => !arg.startsWith('-')),
  });

  const openLink = name => {
    const link = links.get(name);
    if (!link) return text(`open: ${name}: no such link`);
    if (link.protocol === 'mailto:') location.href = link.href;
    else window.open(link.href, '_blank', 'noopener');
    return text(`opening ${link.href}...`);
  };

  const commands = {
    help: () => text(
      'help          show this list',
      'whoami        who is Humbo',
      'ls [dir]      list a directory',
      'cd [dir]      change directory',
      'cat <file>    print a file',
      'open <name>   open a link, for example: open twitch',
      'pwd           print the current directory',
      'echo <text>   print the text',
      'date          print the date and time',
      'history       list the commands you typed',
      'clear         clear the screen',
      '',
      'tab completes, up/down browses history'),
    whoami: () => intro.cloneNode(true),
    ls: args => {
      const { flags, paths: [path = '.'] } = splitFlags(args);
      const target = resolve(path);
      if (!target) return text(`ls: cannot access '${path}': No such file or directory`);
      if (target.file) return text(target.file);
      const names = entries(target.dir);
      if (flags.includes('a')) names.unshift('.', '..', ...(target.dir ? [] : [secretFile]));
      return text(names.join('  '));
    },
    cd: ([path = '~']) => {
      const target = resolve(path);
      if (!target) return text(`cd: ${path}: No such file or directory`);
      if (target.file) return text(`cd: ${path}: Not a directory`);
      cwd = target.dir;
    },
    cat: ([path]) => {
      if (!path) return text('cat: missing file operand');
      const target = resolve(path);
      if (!target) return text(`cat: ${path}: No such file or directory`);
      if (!target.file) return text(`cat: ${path}: Is a directory`);
      if (!target.dir) {
        return text(
          'you found the secret file!',
          '',
          'there is nothing here... yet.',
          'but since you made it this far, come say hi on twitch :)');
      }
      return dirs[target.dir].list.cloneNode(true);
    },
    open: args => args.length ? openLink(args.join(' ').toLowerCase()) : text('usage: open <name>, for example: open twitch'),
    pwd: () => text(cwd ? `/home/visitor/${cwd}` : '/home/visitor'),
    echo: args => text(args.join(' ')),
    date: () => text(new Date().toString()),
    history: () => text(...history.map((line, i) => `${String(i + 1).padStart(4)}  ${line}`)),
    clear: () => {
      for (const section of document.querySelectorAll('section:not(#shell)')) section.hidden = true;
      log.replaceChildren();
    },
  };

  const secrets = {
    sudo: args => text(args.length
      ? 'visitor is not in the sudoers file. This incident will be reported.'
      : 'usage: sudo <command>'),
    rm: args => {
      const { flags, paths } = splitFlags(args);
      if (!paths.length) return text('rm: missing operand');
      if (!paths.includes('/') || !flags.includes('r')) {
        return text(...paths.map(path => `rm: cannot remove '${path}': Permission denied`));
      }
      const output = text();
      const steps = ['deleting /bin...', 'deleting /home/humbo...', 'deleting /etc...', 'deleting the internet...', '', 'just kidding :)'];
      steps.forEach((step, i) => setTimeout(() => {
        output.textContent += (i ? '\n' : '') + step;
        form.scrollIntoView({ block: 'end' });
      }, delay * (i + 1)));
      return output;
    },
    exit: () => text('there is no escape'),
    twitch: () => openLink('twitch'),
    live: () => openLink('twitch'),
    neofetch: () => {
      const seconds = Math.floor(performance.now() / 1000);
      const logo = [' _   _ ', '| | | |', '| |_| |', '|  _  |', '| | | |', '|_| |_|'];
      const info = [
        'visitor@humboshot.com',
        '---------------------',
        'name: Christian "Humbo" Glarmbæk',
        'role: streamer, content creator, maker of small internet things',
        'work: software engineer, mostly building apps',
        `links: ${links.size}`,
        'shell: humbo-sh',
        `uptime: ${Math.floor(seconds / 60)}m ${seconds % 60}s`,
      ];
      const output = el('p', 'lines');
      info.forEach((row, i) => {
        output.append(el('span', 'logo', (logo[i] ?? ' '.repeat(7)) + '   '), row + (i < info.length - 1 ? '\n' : ''));
      });
      return output;
    },
  };
  secrets.fastfetch = secrets.neofetch;

  const shell = el('section');
  shell.id = 'shell';
  const log = el('div');
  const form = el('form', 'cmd');
  const input = el('input');
  Object.assign(input, {
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: false,
    enterKeyHint: 'send',
  });
  input.setAttribute('aria-label', 'Command');
  const field = el('span', 'field');
  const measure = el('span', 'measure');
  field.append(input, measure, cursor);
  form.append(prompt(cwd), field);
  shell.append(log, form);
  document.body.append(shell);

  // The native caret cannot be made thicker, so a block cursor is drawn at the caret position.
  const moveCursor = () => {
    measure.textContent = input.value.slice(0, input.selectionStart);
    cursor.style.left = `${measure.offsetWidth - input.scrollLeft}px`;
    cursor.style.animation = 'none';
    void cursor.offsetWidth;
    cursor.style.animation = '';
  };
  input.addEventListener('input', moveCursor);
  input.addEventListener('scroll', moveCursor);
  document.addEventListener('selectionchange', moveCursor);
  moveCursor();

  const print = (line, output, dir = cwd) => {
    const entry = el('div', 'entry');
    const echo = el('p', 'cmd');
    echo.append(prompt(dir), ' ' + line);
    entry.append(echo);
    if (output) {
      const wrap = el('div', 'output');
      wrap.append(output);
      entry.append(wrap);
    }
    log.append(entry);
  };

  const run = line => {
    const [name, ...args] = line.trim().split(/\s+/);
    const command = name.toLowerCase();
    if (command === 'clear') return commands.clear();
    const dir = cwd;
    let output;
    if (Object.hasOwn(commands, command)) output = commands[command](args);
    else if (Object.hasOwn(secrets, command)) output = secrets[command](args);
    else if (name) output = text(`${name}: command not found`);
    print(line, output, dir);
  };

  const complete = () => {
    const value = input.value;
    const open = value.match(/^open\s+(.*)$/i);
    let prefix, word, options;
    if (open) {
      word = open[1].toLowerCase();
      prefix = value.slice(0, value.length - open[1].length);
      options = [...links.keys()];
    } else {
      const words = value.split(' ');
      word = words.pop();
      prefix = words.length ? words.join(' ') + ' ' : '';
      if (!words.length) {
        options = Object.keys(commands);
      } else {
        const base = word.slice(0, word.lastIndexOf('/') + 1);
        const target = resolve(base || '.');
        if (!target || target.file) return;
        options = entries(target.dir);
        if (!target.dir && word.slice(base.length).startsWith('.')) options.push(secretFile);
        options = options.map(option => base + option);
      }
    }
    const matches = options.filter(option => option.startsWith(word));
    if (matches.length === 1) {
      input.value = prefix + matches[0] + (matches[0].endsWith('/') ? '' : ' ');
    } else if (matches.length > 1) {
      print(value, text(matches.join('  ')));
    }
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const line = input.value;
    if (line.trim()) history.push(line);
    index = history.length;
    input.value = '';
    moveCursor();
    run(line);
    form.firstChild.replaceWith(prompt(cwd));
    form.scrollIntoView({ block: 'end' });
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      index = Math.max(0, Math.min(history.length, index + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = history[index] ?? '';
    } else if (event.key === 'Tab' && input.value) {
      // Only trap Tab while typing, so keyboard users can still tab to the links.
      event.preventDefault();
      complete();
    }
    moveCursor();
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('a') && !getSelection().toString()) input.focus({ preventScroll: true });
  });

  if (matchMedia('(pointer: fine)').matches) input.focus({ preventScroll: true });
})();
