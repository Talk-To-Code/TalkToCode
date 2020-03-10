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
		result += ("if("+this.condition.toSyntax()+"):\n");
		for(int i = 0;i<this.ifBranch.size();i++){
			for(int j = 0; j < this.indent; j++) result+="\t";
			result+= ("\t"+this.ifBranch.get(i).toSyntax());
			if(this.ifBranch.get(i) instanceof ASTSimpleStatement || this.ifBranch.get(i) instanceof ASTComment) result += "\n";
		}
		if(!this.elseIfBranch.isEmpty()){
			for(int index = 0; index < this.elseIfBranch.size(); index++){
				for(int i = 0; i < this.indent; i++) result+="\t";
				result += "elif("+this.elseIfCond.get(index).toSyntax()+"):\n";
				for(int j = 0; j<this.elseIfBranch.get(index).size();j++){
					for(int i = 0; i < this.indent; i++) result+="\t";
					result+=("\t"+this.elseIfBranch.get(index).get(j).toSyntax());
					if(this.elseIfBranch.get(index).get(j) instanceof ASTSimpleStatement || this.elseIfBranch.get(index).get(j) instanceof ASTComment) result += "\n";
				}
			}
				
		}
		if(!this.elseBranch.isEmpty()){
			for(int i = 0; i < this.indent; i++) result+="\t";
			result += "else:\n";
			for(int j = 0; j<this.elseBranch.size();j++){
				for(int i = 0; i < this.indent; i++) result+="\t";
				result+=("\t"+this.elseBranch.get(j).toSyntax());
				if(this.elseBranch.get(j) instanceof ASTSimpleStatement || this.elseBranch.get(j) instanceof ASTComment) result += "\n";
			}
		}
		this.result = result;
		return this.result;
	}
}
