package ast;
/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of syntax generation of comments in Java Programs
 */
public class ASTCommentJ extends ASTComment {

	public ASTCommentJ() {
		super();
	}

	public String toSyntax() {
		for(int i = 0; i < this.statements.size(); i++) {
			this.result = "";
			if(this.statements.get(i) instanceof ASTSimpleStatement) {
				this.result += "//";
				if(this.statements.get(i).toSyntax().charAt(0) != '\"') this.result += this.statements.get(i).toSyntax();
				else this.result += this.statements.get(i).toSyntax().substring(1, this.statements.get(i).toSyntax().length()-3);
			}
			else {
				this.result += "/*\n";
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += this.statements.get(i).toSyntax();
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "*/\n";
			}
		}
		
		return this.result;
	}
}
