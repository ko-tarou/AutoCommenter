import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('AutoCommenter is now active!');

    // コマンド登録（デバッグ用にコマンドパレットからも実行可能）
    let disposable = vscode.commands.registerCommand('autoCommenter.autoComment', async () => {
        console.log('Auto Comment command executed');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No active editor found');
            return; // エディタが開かれていない場合は処理しない
        }

        const document = editor.document;
        const selection = editor.selection;

        // 現在の行のインデックスを取得
        const line = selection.active.line;
        console.log(`Current line: ${line}`);

        // 空白の3行を確認
        if (
            line >= 2 && 
            document.lineAt(line).isEmptyOrWhitespace &&
            document.lineAt(line - 1).isEmptyOrWhitespace &&
            document.lineAt(line - 2).isEmptyOrWhitespace
        ) {
            console.log('Condition met: 3 empty lines detected');
            const position = new vscode.Position(line, 0); // コメントを挿入する位置
            const commentSymbol = document.languageId === 'python' ? '#' : '//'; // 言語によるコメント文字
            const commentText = `${commentSymbol}`;

            // コメントを挿入
            await editor.edit(editBuilder => {
                editBuilder.insert(position, commentText + '\n');
            });
        } else {
            console.log('Condition not met: 3 empty lines not detected');
        }
    });

    context.subscriptions.push(disposable);

    // テキスト変更イベントの監視
    vscode.workspace.onDidChangeTextDocument(event => {
        console.log('Text document changed!');
        const editor = vscode.window.activeTextEditor;
        if (!editor || event.document !== editor.document) {
            console.log('No active editor or document mismatch');
            return; // 編集中のエディタとドキュメントが一致しない場合は無視
        }

        const line = editor.selection.active.line; // 現在のカーソル位置の行を取得
        const document = editor.document;
        console.log(`Cursor on line: ${line}`);

        if (
            line >= 2 && // 行数が3行以上であること
            document.lineAt(line).isEmptyOrWhitespace &&
            document.lineAt(line - 1).isEmptyOrWhitespace &&
            document.lineAt(line - 2).isEmptyOrWhitespace
        ) {
            console.log('Condition met: 3 consecutive empty lines');
            const position = new vscode.Position(line, 0); // コメントを挿入する位置
            const commentSymbol = document.languageId === 'python' ? '#' : '//'; // 言語に応じたコメント文字
            const commentText = `${commentSymbol}`;

            editor.edit(editBuilder => {
                editBuilder.insert(position, commentText + '\n'); // コメントを挿入
            });
        } else {
            console.log('Condition not met: Less than 3 consecutive empty lines');
        }
    });
}

export function deactivate() {
    console.log('AutoCommenter is now deactivated.');
}
