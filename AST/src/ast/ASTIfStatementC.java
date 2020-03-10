package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of syntax generation of if statement in C Programs
 */
public final class ASTIfStatementC extends ASTIfStatement {

	public ASTIfStatementC() {

	}

	public ASTIfStatementC(ASTExpression e) {
		super(e);
	}
	public String toSyntax(){
		String result = "";
		result += ("if("+this.condition.toSyntax()+") {\n");
		for(int i = 0;i<this.ifBranch.size();i++){
			for(int j = 0; j < this.indent; j++) result+="\t";
			result+= ("\t"+this.ifBranch.get(i).toSyntax());
		}
		for(int i = 0; i < this.indent; i++) result+="\t";
		result += "}\n";
		if(!this.elseIfBranch.isEmpty()){
			for(int index = 0; index < this.elseIfBranch.size(); index++){
				for(int i = 0; i < this.indent; i++) result+="\t";
				result += "else if("+this.elseIfCond.get(index).toSyntax()+"){\n";
				for(int j = 0; j<this.elseIfBranch.get(index).size();j++){
					for(int i = 0; i < this.indent; i++) result+="\t";
					result+=("\t"+this.elseIfBranch.get(index).get(j).toSyntax());
				}
				for(int i = 0; i < this.indent; i++) result+="\t";
				result += "}\n";
			}
		}
		if(!this.elseBranch.isEmpty()){
			for(int i = 0; i < this.indent; i++) result+="\t";
			result += "else {\n";
			for(int j = 0; j<this.elseBranch.size();j++){
				for(int i = 0; i < this.indent; i++) result+="\t";
				result+=("\t"+this.elseBranch.get(j).toSyntax());
			}
			for(int i = 0; i < this.indent; i++) result+="\t";
			result +="}\n";
		}
		this.result = result + "\n";
		return this.result;
	}
}
