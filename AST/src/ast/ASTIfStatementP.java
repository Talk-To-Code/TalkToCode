package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of syntax generation of if statement in Python Programs
 */
public class ASTIfStatementP extends ASTIfStatement {

	public ASTIfStatementP() {
	}

	public ASTIfStatementP(ASTExpression e) {
		super(e);

	}
	public String toSyntax(){
		String result = "";
		result += ("if("+this.condition.toSyntax()+"): \n");
		for(int i = 0;i<this.ifBranch.size();i++){
			for(int j = 0; j < this.indent; j++) result+="\t";
			result+= ("\t"+this.ifBranch.get(i).toSyntax());
		}
		result += "\n";
		if(!this.elseBranch.isEmpty()){
			for(int i = 0; i < this.indent; i++) result+="\t";
			result += "else :\n";
			for(int j = 0; j<this.elseBranch.size();j++){
				for(int i = 0; i < this.indent; i++) result+="\t";
				result+=("\t"+this.elseBranch.get(j).toSyntax());
			}
			result +="\n";
		}
		this.result = result;
		return this.result;
	}
}
