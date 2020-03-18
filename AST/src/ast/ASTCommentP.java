package ast;

import java.util.ArrayList;
import java.util.Collections;

/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of syntax generation of comments in Python Programs
 */
public class ASTCommentP extends ASTComment {

	public ASTCommentP() {
		super();
	}

	public String toSyntax() {
		this.result = "";
		if(this.commentedOutLines.isEmpty()) {
			for(int i = 0; i < this.statements.size(); i++) {
				if(this.statements.get(i) instanceof ASTSimpleStatement) {
					this.result += "#";
					if(this.statements.get(i).toSyntax().charAt(0) != '\"') this.result += this.statements.get(i).toSyntax();
					else this.result += this.statements.get(i).toSyntax().substring(1, this.statements.get(i).toSyntax().length()-2);
				}
				else {
					this.result += "\'\'\'\n";
					for(int j = 0; j < this.indent; j++) this.result+="\t";
					if(i < this.statements.size()-1) this.result += this.statements.get(i).toSyntax();
					else this.result += this.statements.get(i).toSyntax().trim() + "\n";
					for(int j = 0; j < this.indent; j++) this.result+="\t";
					this.result += "\'\'\'\n";
				}
			}
		}
		else {
			ArrayList<String> code = new ArrayList<String>();
			int index = 0;
			
			Collections.sort(this.commentedOutLines);
			
			for(ASTStatement s : this.statements) for(String str : s.toSyntax().split("\n",-1)) code.add(str);
			
			for(int i = 0; i < code.size(); i++) {
				if(i == this.commentedOutLines.get(index)) {
					this.result += "#";
					if(index < this.commentedOutLines.size()-1) index++;
				}
				this.result += code.get(i) + "\n";
			}
		}
		
		return this.result;
	}
}
