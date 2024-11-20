import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('AutoCommenter is now active!');

    vscode.workspace.onDidChangeTextDocument(event => {
        console.log('Text document changed!');
        const editor = vscode.window.activeTextEditor;

        if (!editor || event.document !== editor.document) {
            console.log('No active editor or document mismatch');
            return; // アクティブエディタがない、または変更されたドキュメントが現在のエディタのものではない場合は無視
        }

        // 変更箇所をチェック
        const changes = event.contentChanges;
        if (changes.length === 0) {
            console.log('No content changes detected');
            return;
        }

        const lastChange = changes[changes.length - 1];
        console.log(`Last change text: '${lastChange.text}'`);

        // 改行挿入の検出（改行コードに対応: '\n' または '\r\n'）
        if (lastChange.text === '\n' || lastChange.text === '\r\n') {
            const document = editor.document;

            // 改行により新たに移動する行を計算
            const currentLine = lastChange.range.start.line + 1; // カーソルが移動した行（改行後の新しい行）
            console.log(`Cursor on line (after newline): ${currentLine}`);

            const commentSymbol = document.languageId === 'python' ? '#' : '//'; // 言語に応じたコメント記号

            // 空白行の条件をチェックしてコメントを挿入
            if (
                currentLine >= 2 && // 少なくとも3行目にいること
                document.lineAt(currentLine - 1).isEmptyOrWhitespace &&
                document.lineAt(currentLine - 2).isEmptyOrWhitespace
            ) {
                console.log('Condition met: Previous 2 lines are empty');
                const position = new vscode.Position(currentLine, 0); // コメントを挿入する位置
                const commentText = `${commentSymbol}`; // 挿入するコメント

                editor.edit(editBuilder => {
                    editBuilder.insert(position, commentText); // コメントを挿入
                });
            } else {
                console.log('Condition not met: Previous 2 lines are not empty');
            }

            // 前の行のコメントを削除（コメントのみの場合）
            const previousLine = currentLine - 1;
            const previousLineText = document.lineAt(previousLine).text.trim();

            if (previousLineText === commentSymbol) {
                console.log(`Removing comment on line ${previousLine}`);
                const range = document.lineAt(previousLine).range;

                editor.edit(editBuilder => {
                    editBuilder.delete(range); // コメントのみの行を削除
                });
            }
        } else {
            console.log('Change is not a newline insertion');
        }
    });
}

export function deactivate() {
    console.log('AutoCommenter is now deactivated.');
}